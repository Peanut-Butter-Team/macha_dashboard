import { useCallback } from 'react';
import { AdsTab } from '../../components/tabs/AdsTab';
import { PeriodFilter } from '../../components/common/PeriodFilter';
import { useAdData } from '../../hooks/useAdData';
import { useProfileData } from '../../hooks/useProfileData';
import type { PeriodType } from '../../types';

export function AdsPage() {
  const {
    adPerformance,
    dailyAdData,
    campaignPerformance,
    campaignHierarchy,
    campaignDailyData,
    loading: adLoading,
    period,
    customDateRange,
    setPeriod,
    serverSyncTime,
  } = useAdData();

  // 기간 변경 핸들러
  const handlePeriodChange = useCallback((newPeriod: PeriodType) => {
    setPeriod(newPeriod);
  }, [setPeriod]);

  // 사용자 지정 날짜 범위 변경 핸들러
  const handleCustomDateChange = useCallback((start: string, end: string) => {
    setPeriod('custom', { start, end });
  }, [setPeriod]);

  // 프로필 데이터 (AdsTab에 필요)
  const { profileInsight } = useProfileData();

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <PeriodFilter
          period={period}
          onChange={handlePeriodChange}
          customDateRange={customDateRange || { start: '2024-12-01', end: '2024-12-14' }}
          onCustomDateChange={handleCustomDateChange}
        />
        {serverSyncTime && (
          <div className="text-sm text-slate-500">
            마지막 동기화: {serverSyncTime.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
          </div>
        )}
      </div>

      {/* Tab Content */}
      <AdsTab
        adData={adPerformance}
        dailyData={dailyAdData}
        campaignData={campaignPerformance}
        campaignHierarchy={campaignHierarchy}
        campaignDailyData={campaignDailyData}
        profileData={profileInsight}
        loading={adLoading}
        period={period}
      />
    </>
  );
}
