import { Client } from '@notionhq/client';

const notion = new Client({ auth: (process.env.NOTION_TOKEN || '').trim() });

const INFLUENCER_DB_ID = '94d490dd8b654351a6ebeb32a965134f';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 모든 페이지 데이터 가져오기 (페이지네이션)
    let allResults = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: INFLUENCER_DB_ID,
        page_size: 100,
        start_cursor: startCursor,
        sorts: [
          {
            timestamp: 'last_edited_time',
            direction: 'descending'
          }
        ]
      });

      allResults = allResults.concat(response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }

    const influencers = allResults.map((page) => {
      const props = page.properties;

      // 팔로워 수 파싱 (rich_text에서 숫자 추출)
      const followersText = props['팔로워 수']?.rich_text?.[0]?.plain_text || '0';
      const followers = parseInt(followersText.replace(/,/g, '')) || 0;

      // 인스타그램 핸들 추출 (@ 제거)
      const instagramProfile = props['인스타그램 프로필']?.rich_text?.[0]?.plain_text || '';
      const handle = instagramProfile.replace('@', '').trim();

      // 이메일 추출
      const email = props['이메일']?.rich_text?.[0]?.plain_text || '';

      // 참여율 계산 (임시로 팔로워 기반 예상값)
      const engagementRate = followers > 0 ? Math.min(5, (10000 / followers) * 2) : 0;

      // 평균 좋아요/댓글 계산 (임시로 팔로워 기반 예상값)
      const avgLikes = Math.round(followers * (engagementRate / 100));
      const avgComments = Math.round(avgLikes * 0.1);

      return {
        id: page.id,
        name: props['이름']?.title?.[0]?.plain_text || '',
        handle: handle,
        platform: 'instagram',
        category: props['활동 분야']?.multi_select?.map(s => s.name) || [],
        followers: followers,
        engagementRate: parseFloat(engagementRate.toFixed(1)),
        avgLikes: avgLikes,
        avgComments: avgComments,
        email: email,
        phone: props['연락처']?.phone_number || '',
        notes: props['희망 보상']?.multi_select?.map(s => s.name).join(', ') || '',
        status: props['상태']?.status?.name || '',
        profileImage: '',
        createdAt: page.created_time,
        lastModified: page.last_edited_time,
      };
    });

    res.status(200).json(influencers);
  } catch (error) {
    console.error('인플루언서 목록 조회 에러:', error);
    res.status(500).json({
      error: '인플루언서 데이터를 불러오는데 실패했습니다.',
      details: error.message
    });
  }
}
