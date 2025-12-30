import { useState, useEffect, useCallback } from 'react';
import type {
  ProfileInsight,
  DailyProfileData,
  AdPerformance,
  DailyAdData,
  Influencer,
  SeedingItem,
  AffiliateLink,
  ContentItem,
  AIAnalysis,
} from '../types';
import {
  PROFILE_INSIGHT,
  DAILY_PROFILE_DATA,
  AD_PERFORMANCE,
  DAILY_AD_DATA,
  INFLUENCERS,
  SEEDING_LIST,
  AFFILIATE_LINKS,
  CONTENT_LIST,
  AI_ANALYSIS,
} from '../data/dummyData';

// ============================================
// API 호출 구조 - 실제 연동 시 이 함수들을 수정하세요
// ============================================

// API 응답 타입
interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: Date | null;
}

// 공통 fetch 함수 (실제 API 연동 시 사용)
async function fetchFromApi<T>(_endpoint: string): Promise<T> {
  // 실제 API 연동 시 아래 주석을 해제하고 더미 데이터 반환 부분을 제거하세요
  /*
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`, // 인증 토큰 추가
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
  */

  // 현재는 더미 데이터 반환 (API 연동 시 제거)
  await new Promise(resolve => setTimeout(resolve, 300)); // 로딩 시뮬레이션
  throw new Error('Use dummy data'); // 더미 데이터 사용하도록 에러 발생
}

// ============================================
// 프로필 인사이트 (Instagram Graph API)
// ============================================
export function useProfileInsight(): ApiResponse<ProfileInsight> {
  const [data, setData] = useState<ProfileInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFromApi<ProfileInsight>('/instagram/insights');
      setData(result);
    } catch {
      // API 실패 시 더미 데이터 사용
      setData(PROFILE_INSIGHT);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, lastUpdated };
}

// ============================================
// 일별 프로필 데이터 (Instagram Graph API)
// ============================================
export function useDailyProfileData(period: string): ApiResponse<DailyProfileData[]> {
  const [data, setData] = useState<DailyProfileData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFromApi<DailyProfileData[]>(`/instagram/daily?period=${period}`);
      setData(result);
    } catch {
      setData(DAILY_PROFILE_DATA);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, lastUpdated };
}

// ============================================
// 광고 성과 (Meta Ads API)
// ============================================
export function useAdPerformance(): ApiResponse<AdPerformance> {
  const [data, setData] = useState<AdPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFromApi<AdPerformance>('/ads/performance');
      setData(result);
    } catch {
      setData(AD_PERFORMANCE);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, lastUpdated };
}

// ============================================
// 일별 광고 데이터 (Meta Ads API)
// ============================================
export function useDailyAdData(period: string): ApiResponse<DailyAdData[]> {
  const [data, setData] = useState<DailyAdData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFromApi<DailyAdData[]>(`/ads/daily?period=${period}`);
      setData(result);
    } catch {
      setData(DAILY_AD_DATA);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, lastUpdated };
}

// ============================================
// 인플루언서 목록 (DB)
// ============================================
export function useInfluencers(): ApiResponse<Influencer[]> {
  const [data, setData] = useState<Influencer[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFromApi<Influencer[]>('/influencers');
      setData(result);
    } catch {
      setData(INFLUENCERS);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, lastUpdated };
}

// ============================================
// 시딩 목록 (Notion/DB)
// ============================================
export function useSeedingList(): ApiResponse<SeedingItem[]> {
  const [data, setData] = useState<SeedingItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFromApi<SeedingItem[]>('/seeding');
      setData(result);
    } catch {
      setData(SEEDING_LIST);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, lastUpdated };
}

// ============================================
// 제휴 링크 (DB)
// ============================================
export function useAffiliateLinks(): ApiResponse<AffiliateLink[]> {
  const [data, setData] = useState<AffiliateLink[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFromApi<AffiliateLink[]>('/affiliate-links');
      setData(result);
    } catch {
      setData(AFFILIATE_LINKS);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, lastUpdated };
}

// ============================================
// 콘텐츠 목록 (DB)
// ============================================
export function useContentList(): ApiResponse<ContentItem[]> {
  const [data, setData] = useState<ContentItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFromApi<ContentItem[]>('/contents');
      setData(result);
    } catch {
      setData(CONTENT_LIST);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, lastUpdated };
}

// ============================================
// AI 분석 (Backend)
// ============================================
export function useAIAnalysis(): ApiResponse<AIAnalysis> {
  const [data, setData] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFromApi<AIAnalysis>('/ai/analysis');
      setData(result);
    } catch {
      setData(AI_ANALYSIS);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, lastUpdated };
}

// ============================================
// 뮤테이션 함수들 (생성/수정/삭제)
// ============================================

// 제휴 링크 생성
export async function createAffiliateLink(influencerId: string, code: string): Promise<AffiliateLink> {
  // 실제 API 연동 시 아래 주석 해제
  /*
  const response = await fetch(`${API_BASE_URL}/affiliate-links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ influencerId, code }),
  });
  return response.json();
  */

  // 더미 응답
  return {
    id: `aff-${Date.now()}`,
    influencerId,
    influencerName: INFLUENCERS.find(i => i.id === influencerId)?.name || '',
    code,
    url: `https://brand.com/ref/${code.toLowerCase()}`,
    clicks: 0,
    conversions: 0,
    revenue: 0,
    createdAt: new Date().toISOString().split('T')[0],
    isActive: true,
  };
}

// 시딩 상태 업데이트
export async function updateSeedingStatus(
  seedingId: string,
  status: SeedingItem['status']
): Promise<SeedingItem> {
  // 실제 API 연동 시 구현
  const item = SEEDING_LIST.find(s => s.id === seedingId);
  if (!item) throw new Error('Seeding not found');
  return { ...item, status };
}

// 콘텐츠 다운로드 URL 생성
export async function getContentDownloadUrl(contentId: string): Promise<string> {
  // 실제 API 연동 시 서명된 URL 반환
  const content = CONTENT_LIST.find(c => c.id === contentId);
  return content?.downloadUrl || '';
}
