import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 캠페인 분석 프롬프트 생성
function buildCampaignPrompt(campaignName, contents, performanceData) {
  const contentSummary = contents.slice(0, 20).map(c => ({
    influencer: c.influencerName,
    type: c.type,
    likes: c.likes,
    comments: c.comments,
    views: c.views,
    caption: c.caption?.substring(0, 200),
    postedAt: c.postedAt,
  }));

  return `당신은 인플루언서 마케팅 전문가입니다. 다음 캠페인 데이터를 분석하고 인사이트를 제공해주세요.

캠페인명: ${campaignName || '미정'}

성과 요약:
- 총 좋아요: ${performanceData?.totalLikes?.toLocaleString() || 0}
- 총 댓글: ${performanceData?.totalComments?.toLocaleString() || 0}
- 총 공유: ${performanceData?.totalShares?.toLocaleString() || 0}
- 총 조회수: ${performanceData?.totalViews?.toLocaleString() || 0}
- 콘텐츠 수: ${performanceData?.contentCount || 0}

TOP 인플루언서:
${performanceData?.topInfluencers?.map((inf, i) => `${i + 1}. ${inf.name}: 좋아요 ${inf.likes}, 댓글 ${inf.comments}`).join('\n') || '없음'}

최근 콘텐츠 샘플:
${JSON.stringify(contentSummary, null, 2)}

다음 형식으로 JSON 응답해주세요:
{
  "summary": "캠페인 전체 성과에 대한 2-3문장 요약",
  "insights": [
    "인사이트 1 (구체적인 수치와 함께)",
    "인사이트 2 (구체적인 수치와 함께)",
    "인사이트 3 (구체적인 수치와 함께)"
  ],
  "recommendation": "향후 캠페인 전략에 대한 구체적인 추천"
}

반드시 JSON 형식으로만 응답하고, 마크다운이나 다른 텍스트 없이 순수 JSON만 반환해주세요.`;
}

// 프로필 분석 프롬프트 생성
function buildProfilePrompt(profileData, followerDemographic, recentContent) {
  return `당신은 인스타그램 프로필 성장 전문가입니다. 다음 프로필 데이터를 분석하고 성장 전략을 제공해주세요.

프로필 지표:
- 팔로워: ${profileData?.followers?.toLocaleString() || 0} (${profileData?.followersGrowth >= 0 ? '+' : ''}${profileData?.followersGrowth || 0}%)
- 도달: ${profileData?.reach?.toLocaleString() || 0} (${profileData?.reachGrowth >= 0 ? '+' : ''}${profileData?.reachGrowth || 0}%)
- 노출: ${profileData?.impressions?.toLocaleString() || 0} (${profileData?.impressionsGrowth >= 0 ? '+' : ''}${profileData?.impressionsGrowth || 0}%)
- 참여율: ${profileData?.engagementRate || 0}% (${profileData?.engagementRateGrowth >= 0 ? '+' : ''}${profileData?.engagementRateGrowth || 0}%)
- 프로필 방문: ${profileData?.profileViews?.toLocaleString() || 0} (${profileData?.profileViewsGrowth >= 0 ? '+' : ''}${profileData?.profileViewsGrowth || 0}%)
- 웹사이트 클릭: ${profileData?.websiteClicks?.toLocaleString() || 0} (${profileData?.websiteClicksGrowth >= 0 ? '+' : ''}${profileData?.websiteClicksGrowth || 0}%)

팔로워 인구통계:
- 성별: 남성 ${followerDemographic?.gender?.malePercent || 0}%, 여성 ${followerDemographic?.gender?.femalePercent || 0}%
- 주요 연령대: ${followerDemographic?.age?.slice(0, 3).map(a => `${a.range}세(${a.percent}%)`).join(', ') || '정보 없음'}
- 주요 국가: ${followerDemographic?.country?.slice(0, 3).map(c => `${c.name}(${c.percent}%)`).join(', ') || '정보 없음'}

최근 콘텐츠 성과 (최대 10개):
${recentContent?.slice(0, 10).map((c, i) =>
  `${i + 1}. [${c.type}] 조회 ${c.views?.toLocaleString() || 0}, 도달 ${c.reach?.toLocaleString() || 0}, 좋아요 ${c.likes?.toLocaleString() || 0}, 참여율 ${c.engagementRate || 0}%`
).join('\n') || '콘텐츠 데이터 없음'}

다음 형식으로 JSON 응답해주세요:
{
  "summary": "프로필 전체 성과에 대한 2-3문장 요약 (성장세, 강점, 개선점 포함)",
  "insights": [
    "인사이트 1 (콘텐츠 타입별 성과 분석 등)",
    "인사이트 2 (최적 게시 시간 또는 타겟 분석 등)",
    "인사이트 3 (팔로워 성장 또는 참여율 관련 등)",
    "인사이트 4 (프로필 클릭률 또는 전환 관련 등)",
    "인사이트 5 (타겟층 특성 또는 콘텐츠 추천 등)"
  ],
  "recommendation": "프로필 성장을 위한 구체적인 콘텐츠 전략 추천"
}

반드시 JSON 형식으로만 응답하고, 마크다운이나 다른 텍스트 없이 순수 JSON만 반환해주세요.`;
}

// 광고 분석 프롬프트 생성
function buildAdsPrompt(adData, topCampaigns, dailyData) {
  return `당신은 Meta 광고 최적화 전문가입니다. 다음 광고 데이터를 분석하고 성과 개선 전략을 제공해주세요.

전체 광고 성과:
- 총 지출: ₩${adData?.spend?.toLocaleString() || 0} (${adData?.spendGrowth >= 0 ? '+' : ''}${adData?.spendGrowth || 0}%)
- ROAS: ${adData?.roas || 0}x (${adData?.roasGrowth >= 0 ? '+' : ''}${adData?.roasGrowth || 0}%)
- 총 결과: ${adData?.results?.toLocaleString() || 0} (${adData?.resultsGrowth >= 0 ? '+' : ''}${adData?.resultsGrowth || 0}%)
- 결과당 비용: ₩${adData?.costPerResult?.toLocaleString() || 0} (${adData?.costPerResultGrowth >= 0 ? '+' : ''}${adData?.costPerResultGrowth || 0}%)
- 총 도달: ${adData?.reach?.toLocaleString() || 0} (${adData?.reachGrowth >= 0 ? '+' : ''}${adData?.reachGrowth || 0}%)
- 총 클릭: ${adData?.clicks?.toLocaleString() || 0} (${adData?.clicksGrowth >= 0 ? '+' : ''}${adData?.clicksGrowth || 0}%)
- CTR: ${adData?.ctr || 0}% (${adData?.ctrGrowth >= 0 ? '+' : ''}${adData?.ctrGrowth || 0}%)
- CPC: ₩${adData?.cpc?.toLocaleString() || 0} (${adData?.cpcGrowth >= 0 ? '+' : ''}${adData?.cpcGrowth || 0}%)

TOP 캠페인 성과 (최대 5개):
${topCampaigns?.slice(0, 5).map((c, i) =>
  `${i + 1}. ${c.campaignName}: 지출 ₩${c.totalSpend?.toLocaleString() || 0}, ROAS ${c.roas || 0}x, 결과 ${c.totalResults?.toLocaleString() || 0}, 클릭 ${c.totalClicks?.toLocaleString() || 0}`
).join('\n') || '캠페인 데이터 없음'}

최근 7일 일별 추이:
${dailyData?.slice(-7).map(d =>
  `${d.date}: 지출 ₩${d.spend?.toLocaleString() || 0}, ROAS ${d.roas || 0}x, 클릭 ${d.clicks?.toLocaleString() || 0}, CTR ${d.ctr || 0}%`
).join('\n') || '일별 데이터 없음'}

다음 형식으로 JSON 응답해주세요:
{
  "summary": "광고 전체 성과에 대한 2-3문장 요약 (ROAS 동향, 비용 효율성, 개선점 포함)",
  "insights": [
    "인사이트 1 (ROAS 또는 전환 성과 관련)",
    "인사이트 2 (비용 효율성 또는 CPC/CTR 관련)",
    "인사이트 3 (요일별 또는 시간대별 성과 패턴)",
    "인사이트 4 (캠페인별 성과 차이 분석)",
    "인사이트 5 (타겟 또는 크리에이티브 관련 제안)"
  ],
  "recommendation": "광고 성과 개선을 위한 구체적인 예산 배분 또는 최적화 전략 추천"
}

반드시 JSON 형식으로만 응답하고, 마크다운이나 다른 텍스트 없이 순수 JSON만 반환해주세요.`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      type = 'campaign',  // 'campaign' | 'profile' | 'ads'
      campaignName,
      contents,
      performanceData,
      profileData,
      followerDemographic,
      recentContent,
      adData,
      topCampaigns,
      dailyData,
    } = req.body;

    // 타입별 프롬프트 생성
    let prompt;
    let systemMessage;

    switch (type) {
      case 'profile':
        if (!profileData) {
          return res.status(400).json({ error: '프로필 데이터가 필요합니다.' });
        }
        prompt = buildProfilePrompt(profileData, followerDemographic, recentContent);
        systemMessage = '당신은 인스타그램 프로필 성장 전문가입니다. 항상 JSON 형식으로만 응답합니다.';
        break;

      case 'ads':
        if (!adData) {
          return res.status(400).json({ error: '광고 데이터가 필요합니다.' });
        }
        prompt = buildAdsPrompt(adData, topCampaigns, dailyData);
        systemMessage = '당신은 Meta 광고 최적화 전문가입니다. 항상 JSON 형식으로만 응답합니다.';
        break;

      case 'campaign':
      default:
        if (!contents || contents.length === 0) {
          return res.status(400).json({ error: '분석할 콘텐츠가 없습니다.' });
        }
        prompt = buildCampaignPrompt(campaignName, contents, performanceData);
        systemMessage = '당신은 인플루언서 마케팅 캠페인 분석 전문가입니다. 항상 JSON 형식으로만 응답합니다.';
        break;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // JSON 파싱 시도
    let analysis;
    try {
      // JSON 블록 추출 시도
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON not found in response');
      }
    } catch (parseError) {
      console.error('JSON 파싱 에러:', parseError, 'Response:', responseText);
      // 파싱 실패 시 타입별 기본 응답
      analysis = getDefaultAnalysis(type, { performanceData, profileData, adData });
    }

    res.status(200).json({
      ...analysis,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI 분석 에러:', error);
    res.status(500).json({
      error: 'AI 분석 중 오류가 발생했습니다.',
      details: error.message
    });
  }
}

// 타입별 기본 분석 응답
function getDefaultAnalysis(type, data) {
  const { performanceData, profileData, adData } = data;
  switch (type) {
    case 'profile':
      return {
        summary: '프로필 분석을 완료했습니다.',
        insights: [
          `현재 팔로워 수는 ${profileData?.followers?.toLocaleString() || 0}명입니다.`,
          `도달 수는 ${profileData?.reach?.toLocaleString() || 0}입니다.`,
          `참여율은 ${profileData?.engagementRate || 0}%입니다.`,
          `프로필 방문 수는 ${profileData?.profileViews?.toLocaleString() || 0}입니다.`,
          '더 많은 데이터가 필요합니다.'
        ],
        recommendation: '꾸준한 콘텐츠 업로드로 팔로워 성장을 유지하세요.'
      };

    case 'ads':
      return {
        summary: '광고 분석을 완료했습니다.',
        insights: [
          `총 광고 지출은 ₩${adData?.spend?.toLocaleString() || 0}입니다.`,
          `ROAS는 ${adData?.roas || 0}x입니다.`,
          `총 클릭 수는 ${adData?.clicks?.toLocaleString() || 0}입니다.`,
          `CTR은 ${adData?.ctr || 0}%입니다.`,
          '더 많은 데이터가 필요합니다.'
        ],
        recommendation: '광고 성과를 개선하기 위해 타겟팅과 크리에이티브를 테스트해보세요.'
      };

    case 'campaign':
    default:
      return {
        summary: '캠페인 분석을 완료했습니다.',
        insights: [
          `총 ${performanceData?.contentCount || 0}개의 콘텐츠가 게시되었습니다.`,
          `총 ${performanceData?.totalLikes?.toLocaleString() || 0}개의 좋아요를 획득했습니다.`,
          '평균 참여율 분석이 필요합니다.'
        ],
        recommendation: '더 많은 데이터가 수집되면 정확한 분석이 가능합니다.'
      };
  }
}
