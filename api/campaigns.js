import { Client } from '@notionhq/client';

const notion = new Client({ auth: (process.env.NOTION_TOKEN || '').trim() });

const DB_IDS = {
  campaigns: '2b708b1c-348f-8141-999f-f77b91095543',
};

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await notion.databases.query({
      database_id: DB_IDS.campaigns,
    });

    const campaigns = response.results.map((page) => {
      const props = page.properties;
      return {
        id: page.id,
        name: props['캠페인명']?.title?.[0]?.plain_text || props['이름']?.title?.[0]?.plain_text || '',
        category: props['카테고리']?.select?.name || props['카테고리']?.multi_select?.[0]?.name || '',
        campaignType: props['캠페인유형']?.select?.name || '협찬',
        productType: props['협찬제품']?.select?.name || props['제품유형']?.select?.name || '',
        participants: props['참여인원']?.number || props['참여자수']?.rollup?.number || 0,
        startDate: props['시작일']?.date?.start || props['캠페인시작일']?.date?.start || '',
        endDate: props['종료일']?.date?.start || props['캠페인종료일']?.date?.start || '',
        manager: props['담당자']?.rich_text?.[0]?.plain_text || props['담당자']?.people?.[0]?.name || '',
        status: props['상태']?.select?.name || props['진행상태']?.select?.name || 'active',
        budget: props['예산']?.number || 0,
        spent: props['집행금액']?.number || 0,
      };
    });

    res.status(200).json(campaigns);
  } catch (error) {
    console.error('캠페인 목록 조회 에러:', error);
    res.status(500).json({
      error: '캠페인 목록을 불러오는데 실패했습니다.',
      details: error.message
    });
  }
}
