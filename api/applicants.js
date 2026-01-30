import { Client } from '@notionhq/client';

const notion = new Client({ auth: (process.env.NOTION_TOKEN || '').trim() });

// 기본 신청자 DB ID
const DB_IDS = {
  applicants: '2b708b1c348f81b0a367e99677c3c0da', // 사계단백 (기본값)
};

// 계정별 신청자 DB 매핑
const ACCOUNT_APPLICANTS_DB = {
  'w365299': '2b708b1c348f81b0a367e99677c3c0da',      // 사계단백
  'ehddls5151@': '2b708b1c348f81b0a367e99677c3c0da',  // 사계단백
  'sweatif': '2f508b1c348f808a86b1d5596fcf0cfe',      // 스웻이프
};

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 캐시 비활성화 (계정 전환 시 캐시된 데이터 반환 방지)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // loginId로 해당 계정의 DB 조회
    const { loginId } = req.query;
    const dbId = ACCOUNT_APPLICANTS_DB[loginId] || DB_IDS.applicants;
    console.log(`[ApplicantAPI] loginId: ${loginId}, dbId: ${dbId}`);

    // 페이지네이션으로 모든 결과 수집 (Notion API는 최대 100개씩 반환)
    let allResults = [];
    let hasMore = true;
    let nextCursor = undefined;

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: dbId,
        sorts: [
          {
            property: '접수 일시',
            direction: 'descending',
          },
        ],
        start_cursor: nextCursor,
      });

      allResults = allResults.concat(response.results);
      hasMore = response.has_more;
      nextCursor = response.next_cursor;
    }

    const applicants = allResults.map((page) => {
      const props = page.properties;

      // 접수 일시 추출
      const appliedAt = props['접수 일시']?.date?.start || '';

      // 이름 추출 (title 타입)
      const name = props['이름']?.title?.[0]?.plain_text || '';

      // 연락처 추출
      const phoneNumber = props['연락처']?.phone_number || '';

      // 인스타그램 ID 추출 (rich_text 타입)
      const instagramId = props['인스타그램 ID']?.rich_text?.[0]?.plain_text || '';

      // 한 줄 기대평 추출
      const expectation = props['한 줄 기대평']?.rich_text?.[0]?.plain_text || '';

      // 콘텐츠 2차 활용 동의 추출
      const marketingConsent = props['콘텐츠 2차 활용 및 마케팅 이용 동의']?.checkbox || false;

      return {
        id: page.id,
        name,
        phoneNumber,
        instagramId,
        appliedAt,
        expectation,
        marketingConsent,
      };
    });

    res.status(200).json({ applicants });
  } catch (error) {
    console.error('신청자 목록 조회 에러:', error);
    res.status(500).json({
      error: '신청자 목록을 불러오는데 실패했습니다.',
      details: error.message
    });
  }
}
