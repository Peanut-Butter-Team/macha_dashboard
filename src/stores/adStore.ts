import { create } from 'zustand';
import type {
  AdPerformance,
  DailyAdData,
  CampaignPerformance,
  CampaignHierarchy,
  CampaignDailyData,
  PeriodType,
} from '../types';
import type {
  DashAdListItem,
  DashAdCampaignDetailItem,
} from '../types/metaDash';
import {
  fetchDashAdStatisticsSummary,
  fetchDashAdDetailInfo,
} from '../services/metaDashApi';
import {
  mapToAdPerformanceFromCampaignDetail,
  mapToDailyAdDataFromCampaignDetail,
  mapToCampaignPerformanceFromCampaignDetail,
  mapToCampaignHierarchyFromCampaignDetail,
  mapToCampaignDailyData,
  convertStatisticsToCampaignDetail,
} from '../utils/metaDashMapper';
import {
  AD_PERFORMANCE,
  DAILY_AD_DATA,
  CAMPAIGN_PERFORMANCE_DATA,
} from '../data/dummyData';

interface AdState {
  // 원시 API 데이터
  rawCampaignList: DashAdListItem[] | null;
  rawCampaignDetails: DashAdCampaignDetailItem[] | null;

  // 변환된 UI 데이터
  adPerformance: AdPerformance | null;
  dailyAdData: DailyAdData[] | null;
  campaignPerformance: CampaignPerformance[];
  campaignHierarchy: CampaignHierarchy[];
  campaignDailyData: CampaignDailyData[];

  // 상태
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  serverSyncTime: Date | null;

  // 현재 로드된 사용자 ID
  currentUserId: string | null;

  // 현재 선택된 기간
  period: PeriodType;
  customDateRange: { start: string; end: string } | null;

  // 액션
  fetchAllData: (userId: string) => Promise<void>;
  refresh: (userId: string) => Promise<void>;
  setPeriod: (period: PeriodType, customRange?: { start: string; end: string }) => void;
  reset: () => void;
}

async function fetchAllAdDataBatch(
  userId: string
): Promise<{
  campaignList: DashAdListItem[];
  campaignDetails: DashAdCampaignDetailItem[];
}> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const endTime = yesterday.toISOString().split('T')[0];

  // 오늘 기준 3일 전 (기존 my-insight와 동일 범위)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 3);
  const time = startDate.toISOString().split('T')[0];

  // 1. 통계 전체 조회
  const statistics = await fetchDashAdStatisticsSummary(userId, time, endTime);

  // 2. 응답에서 모든 adId 추출 (중복 제거)
  const adIdSet = new Set<string>();
  for (const campaign of (statistics || [])) {
    for (const adSetResp of (campaign.dashAdSetResponses || [])) {
      for (const insight of (adSetResp.responses || [])) {
        if (insight.adId) adIdSet.add(insight.adId);
      }
    }
  }
  const adIds = Array.from(adIdSet);

  // 3. 광고별 상세 조회
  const adDetails = adIds.length > 0
    ? await fetchDashAdDetailInfo(adIds, endTime)
    : [];

  // 4. 어댑터로 기존 매퍼가 기대하는 형태로 변환
  const campaignDetails = convertStatisticsToCampaignDetail(statistics || [], adDetails);
  return { campaignList: [], campaignDetails };
}

/**
 * 서버 동기화 시간 추출
 */
function extractServerSyncTime(campaignDetails: DashAdCampaignDetailItem[]): Date | null {
  const syncTimes: Date[] = [];

  campaignDetails.forEach(detail => {
    detail.adDetailResponseObjs?.forEach(adDetail => {
      adDetail.adSetChildObjs?.forEach(child => {
        if (child.dashAdAccountInsight?.lastSyncedAt) {
          const timeStr = child.dashAdAccountInsight.lastSyncedAt;
          syncTimes.push(new Date(timeStr.endsWith('Z') ? timeStr : timeStr + 'Z'));
        }
      });
    });
  });

  if (syncTimes.length > 0) {
    return syncTimes.sort((a, b) => b.getTime() - a.getTime())[0];
  }

  return null;
}

export const useAdStore = create<AdState>((set, get) => ({
  // 초기 상태
  rawCampaignList: null,
  rawCampaignDetails: null,
  adPerformance: null,
  dailyAdData: null,
  campaignPerformance: [],
  campaignHierarchy: [],
  campaignDailyData: [],
  loading: false,
  error: null,
  lastUpdated: null,
  serverSyncTime: null,
  currentUserId: null,
  period: 'daily',
  customDateRange: null,

  // 모든 광고 데이터 가져오기
  fetchAllData: async (userId: string) => {
    set({ loading: true, error: null, currentUserId: userId });

    try {
      const { campaignList, campaignDetails } = await fetchAllAdDataBatch(userId);

      // 서버 동기화 시간 추출
      const serverSyncTime = extractServerSyncTime(campaignDetails);

      // 현재 선택된 기간으로 데이터 변환
      const { period, customDateRange } = get();
      const adPerformance = mapToAdPerformanceFromCampaignDetail(
        campaignDetails,
        period,
        customDateRange || undefined
      );
      const dailyAdData = mapToDailyAdDataFromCampaignDetail(
        campaignDetails,
        period,
        customDateRange || undefined
      );
      const campaignPerformance = mapToCampaignPerformanceFromCampaignDetail(campaignDetails);
      const campaignHierarchy = mapToCampaignHierarchyFromCampaignDetail(
        campaignDetails,
        period,
        customDateRange || undefined
      );
      const campaignDailyData = mapToCampaignDailyData(campaignDetails);

      set({
        rawCampaignList: campaignList,
        rawCampaignDetails: campaignDetails,
        adPerformance,
        dailyAdData,
        campaignPerformance,
        campaignHierarchy,
        campaignDailyData,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        serverSyncTime,
      });
    } catch (err) {
      console.error('광고 데이터 조회 실패:', err);

      // 폴백: 더미 데이터
      set({
        adPerformance: AD_PERFORMANCE,
        dailyAdData: DAILY_AD_DATA,
        campaignPerformance: CAMPAIGN_PERFORMANCE_DATA,
        campaignHierarchy: [],
        campaignDailyData: [],
        loading: false,
        error: err instanceof Error ? err.message : '데이터를 불러올 수 없습니다',
        lastUpdated: new Date(),
      });
    }
  },

  // 강제 새로고침
  refresh: async (userId: string) => {
    set({ loading: true, error: null });

    try {
      const { campaignList, campaignDetails } = await fetchAllAdDataBatch(userId);

      // 서버 동기화 시간 추출
      const serverSyncTime = extractServerSyncTime(campaignDetails);

      // 현재 선택된 기간으로 데이터 변환
      const { period, customDateRange } = get();
      const adPerformance = mapToAdPerformanceFromCampaignDetail(
        campaignDetails,
        period,
        customDateRange || undefined
      );
      const dailyAdData = mapToDailyAdDataFromCampaignDetail(
        campaignDetails,
        period,
        customDateRange || undefined
      );
      const campaignPerformance = mapToCampaignPerformanceFromCampaignDetail(campaignDetails);
      const campaignHierarchy = mapToCampaignHierarchyFromCampaignDetail(
        campaignDetails,
        period,
        customDateRange || undefined
      );
      const campaignDailyData = mapToCampaignDailyData(campaignDetails);

      set({
        rawCampaignList: campaignList,
        rawCampaignDetails: campaignDetails,
        adPerformance,
        dailyAdData,
        campaignPerformance,
        campaignHierarchy,
        campaignDailyData,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        serverSyncTime,
      });
    } catch (err) {
      console.error('광고 데이터 새로고침 실패:', err);
      set({
        loading: false,
        error: err instanceof Error ? err.message : '데이터를 불러올 수 없습니다',
      });
    }
  },

  // 기간 변경 (API 재호출 없이 rawCampaignDetails로 재계산)
  setPeriod: (newPeriod: PeriodType, customRange?: { start: string; end: string }) => {
    const { rawCampaignDetails } = get();

    // 기간 상태 업데이트
    set({
      period: newPeriod,
      customDateRange: customRange || null,
    });

    // rawCampaignDetails가 있으면 모든 데이터 재계산
    if (rawCampaignDetails && rawCampaignDetails.length > 0) {
      const adPerformance = mapToAdPerformanceFromCampaignDetail(
        rawCampaignDetails,
        newPeriod,
        customRange
      );
      const dailyAdData = mapToDailyAdDataFromCampaignDetail(
        rawCampaignDetails,
        newPeriod,
        customRange
      );
      const campaignHierarchy = mapToCampaignHierarchyFromCampaignDetail(
        rawCampaignDetails,
        newPeriod,
        customRange
      );

      set({ adPerformance, dailyAdData, campaignHierarchy });
    }
  },

  // Store 리셋
  reset: () => {
    set({
      rawCampaignList: null,
      rawCampaignDetails: null,
      adPerformance: null,
      dailyAdData: null,
      campaignPerformance: [],
      campaignHierarchy: [],
      campaignDailyData: [],
      loading: false,
      error: null,
      lastUpdated: null,
      serverSyncTime: null,
      currentUserId: null,
      period: 'daily',
      customDateRange: null,
    });
  },
}));
