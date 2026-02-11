import { useCallback } from 'react';
import { ProfileTab } from '../../components/tabs/ProfileTab';
import { PeriodFilter } from '../../components/common/PeriodFilter';
import { useProfileData } from '../../hooks/useProfileData';
import type { PeriodType } from '../../types';

export function ProfilePage() {
  const {
    profileInsight,
    dailyProfileData,
    followerDemographic,
    profileContent,
    loading,
    period,
    customDateRange,
    setPeriod,
    serverSyncTime,
  } = useProfileData();

  // 기간 필터 핸들러
  const handlePeriodChange = useCallback((newPeriod: PeriodType) => {
    setPeriod(newPeriod);
  }, [setPeriod]);

  const handleCustomDateChange = useCallback((start: string, end: string) => {
    setPeriod('custom', { start, end });
  }, [setPeriod]);

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <PeriodFilter
          period={period}
          onChange={handlePeriodChange}
          customDateRange={customDateRange ?? { start: '', end: '' }}
          onCustomDateChange={handleCustomDateChange}
        />
        {serverSyncTime && (
          <div className="text-sm text-slate-500">
            마지막 동기화: {serverSyncTime.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
          </div>
        )}
      </div>

      {/* Tab Content */}
      <ProfileTab
        profileData={profileInsight}
        dailyData={dailyProfileData}
        followerDemographic={followerDemographic}
        contentData={profileContent}
        loading={loading}
        period={period}
      />
    </>
  );
}
