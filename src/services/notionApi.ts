// Notion API 서비스
// 서버에서 Notion 데이터를 가져오는 API 클라이언트

// Vercel에서는 같은 도메인이므로 빈 문자열, 로컬에서는 localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// 공통 fetch 래퍼
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============================================
// 타입 정의
// ============================================

export interface NotionCampaign {
  id: string;
  name: string;
  category: string;
  campaignType: '협찬' | '유료';
  productType: string;
  participants: number;
  startDate: string;
  endDate: string;
  manager: string;
  status: 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
}

export interface NotionInfluencer {
  id: string;
  name: string;
  handle: string;
  platform: string;
  thumbnail: string;
  followers: number;
  engagementRate: number;
  avgLikes: number;
  avgComments: number;
  category: string[];
  priceRange: string;
  verified: boolean;
  status: string;
  email: string;
  phone: string;
}

export interface NotionMention {
  id: string;
  influencerName: string;
  platform: string;
  type: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  postUrl: string;
  postedAt: string;
  caption: string;
}

export interface NotionDailyReport {
  id: string;
  date: string;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  followers: number;
  engagement: number;
}

export interface NotionSeeding {
  id: string;
  influencer: {
    id: string;
    name: string;
    handle: string;
    thumbnail: string;
    followers: number;
    engagementRate: number;
  };
  type: 'paid' | 'free';
  status: string;
  paymentAmount: number;
  productValue: number;
  notes: string;
  requestDate: string;
  postDate: string;
}

export interface DashboardStats {
  totalCampaigns: number;
  totalInfluencers: number;
  totalMentions: number;
  performance: {
    reach: number;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
}

// ============================================
// API 함수
// ============================================

// 캠페인 목록 조회
export async function fetchCampaigns(): Promise<NotionCampaign[]> {
  return fetchApi<NotionCampaign[]>('/api/campaigns');
}

// 캠페인 상세 조회
export async function fetchCampaignById(id: string): Promise<NotionCampaign> {
  return fetchApi<NotionCampaign>(`/api/campaigns/${id}`);
}

// 인플루언서 목록 조회
export async function fetchInfluencers(): Promise<NotionInfluencer[]> {
  return fetchApi<NotionInfluencer[]>('/api/influencers');
}

// 멘션 (콘텐츠 성과) 조회
export async function fetchMentions(campaignId?: string): Promise<NotionMention[]> {
  const query = campaignId ? `?campaignId=${campaignId}` : '';
  return fetchApi<NotionMention[]>(`/api/mentions${query}`);
}

// 일별 리포트 조회
export async function fetchDailyReport(params?: {
  campaignId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<NotionDailyReport[]> {
  const searchParams = new URLSearchParams();
  if (params?.campaignId) searchParams.set('campaignId', params.campaignId);
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);

  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return fetchApi<NotionDailyReport[]>(`/api/daily-report${query}`);
}

// 대시보드 통계 조회
export async function fetchDashboardStats(campaignId?: string): Promise<DashboardStats> {
  const query = campaignId ? `?campaignId=${campaignId}` : '';
  return fetchApi<DashboardStats>(`/api/dashboard${query}`);
}

// 시딩 (캠페인 참여자) 조회
export async function fetchSeeding(campaignId: string): Promise<NotionSeeding[]> {
  return fetchApi<NotionSeeding[]>(`/api/seeding?campaignId=${campaignId}`);
}
