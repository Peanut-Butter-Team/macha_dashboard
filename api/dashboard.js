import { Client } from '@notionhq/client';

const notion = new Client({ auth: (process.env.NOTION_TOKEN || '').trim() });

const DB_IDS = {
  influencers: '94d490dd-8b65-4351-a6eb-eb32a965134f',
  campaigns: '2b708b1c-348f-8141-999f-f77b91095543',
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
    // 캠페인 수 조회
    const campaignsRes = await notion.databases.query({
      database_id: DB_IDS.campaigns,
    });

    // 인플루언서 수 조회
    const influencersRes = await notion.databases.query({
      database_id: DB_IDS.influencers,
    });

    // 멘션 데이터 조회
    const mentionsRes = await notion.databases.query({
      database_id: DB_IDS.mentions,
      page_size: 100,
    });

    // 통계 계산
    let totalReach = 0;
    let totalImpressions = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalViews = 0;

    mentionsRes.results.forEach((page) => {
      const props = page.properties;
      totalReach += props['도달']?.number || 0;
      totalImpressions += props['노출']?.number || 0;
      totalLikes += props['좋아요']?.number || 0;
      totalComments += props['댓글']?.number || 0;
      totalShares += props['공유']?.number || 0;
      totalViews += props['조회수']?.number || 0;
    });

    res.status(200).json({
      totalCampaigns: campaignsRes.results.length,
      totalInfluencers: influencersRes.results.length,
      totalMentions: mentionsRes.results.length,
      performance: {
        reach: totalReach,
        impressions: totalImpressions,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        views: totalViews,
      },
    });
  } catch (error) {
    console.error('대시보드 통계 조회 에러:', error);
    res.status(500).json({
      error: '대시보드 통계를 불러오는데 실패했습니다.',
      details: error.message
    });
  }
}
