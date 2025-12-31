import { Client } from '@notionhq/client';

const notion = new Client({ auth: (process.env.NOTION_TOKEN || '').trim() });

const DB_IDS = {
  influencers: '94d490dd-8b65-4351-a6eb-eb32a965134f',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await notion.databases.query({
      database_id: DB_IDS.influencers,
    });

    const influencers = response.results.map((page) => {
      const props = page.properties;
      return {
        id: page.id,
        name: props['이름']?.title?.[0]?.plain_text || '',
        handle: props['핸들']?.rich_text?.[0]?.plain_text || props['인스타그램']?.rich_text?.[0]?.plain_text || '',
        platform: props['플랫폼']?.select?.name || 'instagram',
        thumbnail: props['프로필이미지']?.url || props['프로필']?.files?.[0]?.file?.url || '',
        followers: props['팔로워']?.number || props['팔로워수']?.number || 0,
        engagementRate: props['참여율']?.number || 0,
        avgLikes: props['평균좋아요']?.number || 0,
        avgComments: props['평균댓글']?.number || 0,
        category: props['카테고리']?.multi_select?.map((s) => s.name) || [],
        priceRange: props['단가']?.rich_text?.[0]?.plain_text || '',
        verified: props['인증']?.checkbox || false,
        status: props['상태']?.select?.name || '',
        email: props['이메일']?.email || '',
        phone: props['연락처']?.phone_number || '',
      };
    });

    res.status(200).json(influencers);
  } catch (error) {
    console.error('인플루언서 목록 조회 에러:', error);
    res.status(500).json({
      error: '인플루언서 목록을 불러오는데 실패했습니다.',
      details: error.message
    });
  }
}
