import { Client } from '@notionhq/client';

const notion = new Client({ auth: (process.env.NOTION_TOKEN || '').trim() });

const DB_IDS = {
  mentions: '2bd08b1c348f8023bf04fa37fc57d0b6',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { campaignId } = req.query;

    const queryOptions = {
      database_id: DB_IDS.mentions,
      page_size: 100,
      // 최신 데이터 우선 정렬 (Notion 생성일 기준)
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending',
        },
      ],
    };

    // 캠페인 ID로 필터링 (실제 속성명: '캠페인 DB')
    if (campaignId) {
      queryOptions.filter = {
        property: '캠페인 DB',
        relation: { contains: campaignId },
      };
    }

    const response = await notion.databases.query(queryOptions);

    // Post URL 기준으로 중복 제거 (최신 데이터만 유지)
    const seenPostUrls = new Map();

    response.results.forEach((page) => {
      const props = page.properties;
      const postUrl = props['Post URL']?.url || '';

      // Post URL이 없으면 제외
      if (!postUrl) return;

      // 이미 본 URL이면 스킵 (최신 데이터가 먼저 오므로)
      if (seenPostUrls.has(postUrl)) return;

      // 썸네일 URL 추출
      const thumbnailFile = props['displayUrl']?.files?.[0];
      const thumbnail = thumbnailFile?.external?.url || thumbnailFile?.file?.url || '';

      const mention = {
        id: page.id,
        influencerName: props['ownerFulName']?.rich_text?.[0]?.plain_text || props['ownerUsername']?.rich_text?.[0]?.plain_text || '',
        handle: props['ownerUsername']?.rich_text?.[0]?.plain_text || '',
        platform: 'instagram',
        type: props['type']?.select?.name?.toLowerCase() || 'post',
        likes: props['likesCounts']?.number || 0,
        comments: props['commentsCount']?.number || 0,
        shares: props['reshareCount']?.number || 0,
        views: props['VideoPlayCount']?.number || 0,
        reach: 0,
        impressions: 0,
        engagementRate: 0,
        postUrl,
        postedAt: props['피드게시일']?.date?.start || '',
        caption: props['caption']?.rich_text?.[0]?.plain_text || '',
        thumbnail,
        createdAt: page.created_time,
      };

      seenPostUrls.set(postUrl, mention);
    });

    // Map에서 배열로 변환
    const mentions = Array.from(seenPostUrls.values());

    console.log(`[Mentions API] Total: ${response.results.length}, After dedup: ${mentions.length}`);

    res.status(200).json(mentions);
  } catch (error) {
    console.error('멘션 조회 에러:', error);
    res.status(500).json({
      error: '멘션 데이터를 불러오는데 실패했습니다.',
      details: error.message
    });
  }
}
