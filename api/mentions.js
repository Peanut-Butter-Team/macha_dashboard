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
    };

    if (campaignId) {
      queryOptions.filter = {
        property: '캠페인',
        relation: { contains: campaignId },
      };
    }

    const response = await notion.databases.query(queryOptions);

    const mentions = response.results.map((page) => {
      const props = page.properties;
      return {
        id: page.id,
        influencerName: props['크리에이터']?.rich_text?.[0]?.plain_text || props['인플루언서']?.relation?.[0]?.id || '',
        platform: props['플랫폼']?.select?.name || 'instagram',
        type: props['콘텐츠유형']?.select?.name || props['유형']?.select?.name || 'post',
        likes: props['좋아요']?.number || 0,
        comments: props['댓글']?.number || 0,
        shares: props['공유']?.number || 0,
        views: props['조회수']?.number || 0,
        reach: props['도달']?.number || 0,
        impressions: props['노출']?.number || 0,
        engagementRate: props['참여율']?.number || 0,
        postUrl: props['게시물URL']?.url || props['URL']?.url || '',
        postedAt: props['게시일']?.date?.start || '',
        caption: props['캡션']?.rich_text?.[0]?.plain_text || '',
      };
    });

    res.status(200).json(mentions);
  } catch (error) {
    console.error('멘션 조회 에러:', error);
    res.status(500).json({
      error: '멘션 데이터를 불러오는데 실패했습니다.',
      details: error.message
    });
  }
}
