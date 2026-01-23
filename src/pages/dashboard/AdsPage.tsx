import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { AdsTab } from '../../components/tabs/AdsTab';
import { PeriodFilter } from '../../components/common/PeriodFilter';
import {
  useProfileInsight,
  useAdPerformance,
  useDailyAdData,
} from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { syncDashAd } from '../../services/metaDashApi';
import type { PeriodType } from '../../types';

export function AdsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<PeriodType>('daily');
  const [customDateRange, setCustomDateRange] = useState({
    start: '2024-12-01',
    end: '2024-12-14',
  });
  const [syncing, setSyncing] = useState(false);

  // API 데이터
  const { data: profileData } = useProfileInsight();
  const { data: adData, loading: adLoading, refetch: refetchAd } = useAdPerformance(user?.id);
  const { data: dailyAdData, loading: dailyAdLoading, refetch: refetchDailyAd, serverSyncTime } = useDailyAdData(period, user?.id);

  // 페이지 마운트 시 데이터 새로고침
  useEffect(() => {
    refetchAd();
    refetchDailyAd();
  }, [refetchAd, refetchDailyAd]);

  // 광고 동기화 핸들러
  const handleRefreshAds = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);

    try {
      console.log('광고 데이터 동기화 시작...');

      if (user?.id) {
        const syncSuccess = await syncDashAd(user.id);
        console.log('광고 동기화 결과:', syncSuccess);
      }

      await Promise.all([
        refetchAd(),
        refetchDailyAd(),
      ]);

      console.log('광고 데이터 새로고침 완료');
    } catch (error) {
      console.error('광고 동기화 실패:', error);
    } finally {
      setSyncing(false);
    }
  }, [syncing, user?.id, refetchAd, refetchDailyAd]);

  const isLoading = adLoading || dailyAdLoading;

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <PeriodFilter
          period={period}
          onChange={setPeriod}
          customDateRange={customDateRange}
          onCustomDateChange={(start, end) => setCustomDateRange({ start, end })}
        />

        <div className="flex items-center gap-3">
          {serverSyncTime && (
            <div className="text-sm text-slate-500">
              마지막 동기화: {serverSyncTime.toLocaleString('ko-KR')}
            </div>
          )}
          <button
            onClick={handleRefreshAds}
            disabled={syncing}
            className={`flex items-center gap-2 px-3 py-1.5 text-white text-sm font-medium rounded-lg transition-colors ${
              syncing ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {syncing ? '동기화 중...' : '동기화'}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <AdsTab
        adData={adData?.adPerformance || null}
        dailyData={dailyAdData}
        campaignData={adData?.campaignData || []}
        campaignHierarchy={adData?.campaignHierarchy || []}
        profileData={profileData}
        loading={isLoading}
      />
    </>
  );
}
