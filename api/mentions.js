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

    // 첫 번째 결과의 속성 구조 로깅 (디버깅용)
    if (response.results.length > 0) {
      const firstProps = response.results[0].properties;
      console.log('[Mentions API] Available properties:', Object.keys(firstProps));

      // 썸네일 관련 필드 찾기
      const thumbnailFields = Object.keys(firstProps).filter(key =>
        key.toLowerCase().includes('thumbnail') ||
        key.toLowerCase().includes('image') ||
        key.toLowerCase().includes('display') ||
        key.toLowerCase().includes('url') ||
        key.toLowerCase().includes('사진') ||
        key.toLowerCase().includes('이미지')
      );
      console.log('[Mentions API] Potential thumbnail fields:', thumbnailFields);

      // 각 잠재적 썸네일 필드의 값 로깅
      thumbnailFields.forEach(field => {
        console.log(`[Mentions API] ${field}:`, JSON.stringify(firstProps[field], null, 2));
      });
    }

    // Post URL 기준으로 중복 제거 (최신 데이터만 유지)
    const seenPostUrls = new Map();

    response.results.forEach((page) => {
      const props = page.properties;
      const postUrl = props['Post URL']?.url || '';

      // Post URL이 없으면 제외
      if (!postUrl) return;

      // 이미 본 URL이면 스킵 (최신 데이터가 먼저 오므로)
      if (seenPostUrls.has(postUrl)) return;

      // 썸네일 URL 추출 (여러 가능한 필드 시도)
      let thumbnail = '';

      // 1. displayUrl 필드
      const displayUrlFile = props['displayUrl']?.files?.[0];
      if (displayUrlFile) {
        thumbnail = displayUrlFile?.external?.url || displayUrlFile?.file?.url || '';
      }

      // 2. thumbnail 필드
      if (!thumbnail) {
        const thumbnailFile = props['thumbnail']?.files?.[0];
        if (thumbnailFile) {
          thumbnail = thumbnailFile?.external?.url || thumbnailFile?.file?.url || '';
        }
      }

      // 3. image 필드
      if (!thumbnail) {
        const imageFile = props['image']?.files?.[0];
        if (imageFile) {
          thumbnail = imageFile?.external?.url || imageFile?.file?.url || '';
        }
      }

      // 4. 이미지 필드 (한글)
      if (!thumbnail) {
        const imageKorFile = props['이미지']?.files?.[0];
        if (imageKorFile) {
          thumbnail = imageKorFile?.external?.url || imageKorFile?.file?.url || '';
        }
      }

      // 5. URL 타입의 displayUrl
      if (!thumbnail && props['displayUrl']?.url) {
        thumbnail = props['displayUrl'].url;
      }

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
