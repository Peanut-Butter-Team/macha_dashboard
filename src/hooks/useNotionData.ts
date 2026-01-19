import { useState, useEffect, useCallback } from 'react';
import {
  fetchCampaigns,
  type NotionCampaign,
} from '../services/notionApi';

// ============================================
// 캠페인 목록 훅
// ============================================
export function useCampaigns(dashMemberId?: string) {
  const [campaigns, setCampaigns] = useState<NotionCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!dashMemberId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchCampaigns(dashMemberId);
      setCampaigns(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch campaigns'));
      console.error('캠페인 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [dashMemberId]);

  useEffect(() => {
    load();
  }, [load]);

  return { campaigns, loading, error, refetch: load };
}
