export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, password } = req.body;

    const response = await fetch('https://matcha.pnutbutter.kr/api/v1/dash-members/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({
      responseCode: -1,
      message: '로그인 처리 중 오류가 발생했습니다.',
    });
  }
}
