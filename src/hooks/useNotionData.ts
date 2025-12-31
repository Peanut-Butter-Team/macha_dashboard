import { useState, useEffect, useCallback } from 'react';
import {
  fetchCampaigns,
  fetchCampaignById,
  fetchInfluencers,
  fetchMentions,
  fetchDailyReport,
  fetchDashboardStats,
  fetchSeeding,
  type NotionCampaign,
  type NotionInfluencer,
  type NotionMention,
  type NotionDailyReport,
  type NotionSeeding,
  type DashboardStats,
} from '../services/notionApi';

// 환경변수로 Notion 연동 활성화 여부 확인
const USE_NOTION = import.meta.env.VITE_USE_NOTION === 'true';

// ============================================
// 캠페인 목록 훅
// ============================================
export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<NotionCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!USE_NOTION) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchCampaigns();
      setCampaigns(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch campaigns'));
      console.error('캠페인 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { campaigns, loading, error, refetch: load, isNotionEnabled: USE_NOTION };
}

// ============================================
// 캠페인 상세 훅
// ============================================
export function useCampaignDetail(campaignId: string | null) {
  const [campaign, setCampaign] = useState<NotionCampaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!USE_NOTION || !campaignId) {
      setCampaign(null);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchCampaignById(campaignId);
        setCampaign(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch campaign'));
        console.error('캠페인 상세 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [campaignId]);

  return { campaign, loading, error, isNotionEnabled: USE_NOTION };
}

// ============================================
// 인플루언서 목록 훅
// ============================================
export function useInfluencers() {
  const [influencers, setInfluencers] = useState<NotionInfluencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!USE_NOTION) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchInfluencers();
      setInfluencers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch influencers'));
      console.error('인플루언서 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { influencers, loading, error, refetch: load, isNotionEnabled: USE_NOTION };
}

// ============================================
// 멘션 (콘텐츠 성과) 훅
// ============================================
export function useMentions(campaignId?: string) {
  const [mentions, setMentions] = useState<NotionMention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!USE_NOTION) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchMentions(campaignId);
      setMentions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch mentions'));
      console.error('멘션 데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    load();
  }, [load]);

  return { mentions, loading, error, refetch: load, isNotionEnabled: USE_NOTION };
}

// ============================================
// 일별 리포트 훅
// ============================================
export function useDailyReport(params?: {
  campaignId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const [dailyData, setDailyData] = useState<NotionDailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!USE_NOTION) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchDailyReport(params);
      setDailyData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch daily report'));
      console.error('일별 리포트 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [params?.campaignId, params?.startDate, params?.endDate]);

  useEffect(() => {
    load();
  }, [load]);

  return { dailyData, loading, error, refetch: load, isNotionEnabled: USE_NOTION };
}

// ============================================
// 대시보드 통계 훅
// ============================================
export function useDashboardStats(campaignId?: string) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!USE_NOTION) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchDashboardStats(campaignId);
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard stats'));
      console.error('대시보드 통계 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, loading, error, refetch: load, isNotionEnabled: USE_NOTION };
}

// ============================================
// 시딩 (캠페인 참여자) 훅
// ============================================
export function useSeeding(campaignId: string | null) {
  const [seedingList, setSeedingList] = useState<NotionSeeding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!USE_NOTION || !campaignId) {
      setSeedingList([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchSeeding(campaignId);
      setSeedingList(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch seeding'));
      console.error('시딩 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    load();
  }, [load]);

  return { seedingList, loading, error, refetch: load, isNotionEnabled: USE_NOTION };
}
