import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { ProfileTab } from '../../components/tabs/ProfileTab';
import { PeriodFilter } from '../../components/common/PeriodFilter';
import {
  useProfileInsight,
  useDailyProfileData,
  useFollowerDemographic,
  useProfileContent,
} from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { syncDashMember } from '../../services/metaDashApi';
import type { PeriodType } from '../../types';

export function ProfilePage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<PeriodType>('daily');
  const [customDateRange, setCustomDateRange] = useState({
    start: '2024-12-01',
    end: '2024-12-14',
  });
  const [syncing, setSyncing] = useState(false);

  // API 데이터
  const { data: profileData, loading: profileLoading, refetch: refetchProfile, serverSyncTime } = useProfileInsight();
  const { data: dailyProfileData, loading: dailyProfileLoading, refetch: refetchDailyProfile } = useDailyProfileData(period);
  const { data: followerDemographic, loading: followerDemographicLoading, refetch: refetchFollowerDemographic } = useFollowerDemographic();
  const { data: profileContent, loading: profileContentLoading, refetch: refetchProfileContent } = useProfileContent();

  // 페이지 마운트 시 데이터 새로고침
  useEffect(() => {
    refetchProfile();
    refetchDailyProfile();
    refetchFollowerDemographic();
    refetchProfileContent();
  }, [refetchProfile, refetchDailyProfile, refetchFollowerDemographic, refetchProfileContent]);

  // 동기화 핸들러
  const handleRefreshProfile = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);

    try {
      console.log('프로필 데이터 동기화 시작...');

      if (user?.id) {
        const syncSuccess = await syncDashMember(user.id);
        console.log('프로필 동기화 결과:', syncSuccess);
      }

      await Promise.all([
        refetchProfile(),
        refetchDailyProfile(),
        refetchFollowerDemographic(),
        refetchProfileContent(),
      ]);

      console.log('프로필 데이터 새로고침 완료');
    } catch (error) {
      console.error('프로필 동기화 실패:', error);
    } finally {
      setSyncing(false);
    }
  }, [syncing, user?.id, refetchProfile, refetchDailyProfile, refetchFollowerDemographic, refetchProfileContent]);

  const isLoading = profileLoading || dailyProfileLoading || followerDemographicLoading || profileContentLoading;

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
            onClick={handleRefreshProfile}
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
      <ProfileTab
        profileData={profileData}
        dailyData={dailyProfileData}
        followerDemographic={followerDemographic}
        contentData={profileContent}
        loading={isLoading}
      />
    </>
  );
}
