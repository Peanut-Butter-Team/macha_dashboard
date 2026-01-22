import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { InfoTooltip } from '../common/InfoTooltip';
import { getProxiedImageUrl } from '../../utils/imageProxy';
import { useCampaignDetail } from '../../hooks/useApi';
import type { AdPerformance, DailyAdData, ProfileInsight, CampaignHierarchy } from '../../types';
import type { DashAdListItem } from '../../types/metaDash';

interface AdsTabProps {
  adData: AdPerformance | null;
  dailyData: DailyAdData[] | null;
  campaignList: DashAdListItem[];
  profileData: ProfileInsight | null;
  loading: boolean;
  userId: string;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const formatCurrency = (num: number): string => {
  if (num >= 100000000) return '₩' + (num / 100000000).toFixed(1) + '억';
  if (num >= 10000000) return '₩' + (num / 10000).toFixed(0) + '만';
  if (num >= 10000) return '₩' + (num / 10000).toFixed(0) + '만';
  return '₩' + num.toLocaleString();
};

// 광고 AI 분석 데이터
const adAIAnalysis = {
  summary: '이번 캠페인은 전월 대비 ROAS가 23% 상승하며 우수한 성과를 기록하고 있습니다. 특히 리타게팅 캠페인의 전환율이 기대 이상입니다.',
  insights: [
    '리타게팅 캠페인이 ROAS 6.8x로 가장 높은 수익률을 기록 중입니다.',
    '주말(토-일) 광고 효율이 평일 대비 35% 높게 나타났습니다.',
    '25-34세 여성 타겟층에서 가장 높은 전환이 발생했습니다.',
    'CPC가 전월 대비 12% 감소하여 비용 효율이 개선되었습니다.',
    '브랜드 인지도 캠페인은 도달은 높으나 전환율 개선이 필요합니다.',
  ],
  recommendation: '리타게팅 캠페인 예산을 20% 증액하고, 브랜드 인지도 캠페인의 크리에이티브를 교체하는 것을 권장합니다. 주말 집중 노출 전략도 검토해 주세요.',
  generatedAt: '2024-12-14T15:30:00Z',
};

// KPI 카드 컴포넌트 (로컬) - 컴팩트 버전
function AdKPICard({
  title,
  value,
  subValue,
  change,
  isPositive,
  metricKey,
  loading,
}: {
  title: string;
  value: string;
  subValue?: string;
  change: number;
  isPositive: boolean;
  metricKey?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse h-[100px]">
        <div className="h-3 bg-slate-200 rounded w-16 mb-2" />
        <div className="h-6 bg-slate-200 rounded w-24 mb-1" />
        <div className="h-3 bg-slate-200 rounded w-20" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow h-[100px] flex flex-col justify-between">
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-500">{title}</span>
        {metricKey && <InfoTooltip metricKey={metricKey} />}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 leading-tight">{value}</div>
        {subValue && <div className="text-xs text-slate-400">{subValue}</div>}
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        <span>전일 대비 {change > 0 ? '+' : ''}{change.toFixed(1)}%</span>
      </div>
    </div>
  );
}

// 파이 차트 컴포넌트
function SourcePieChart({
  title,
  data,
  metricKey,
}: {
  title: string;
  data: { name: string; value: number; color: string }[];
  metricKey?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
        {metricKey && <InfoTooltip metricKey={metricKey} />}
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-slate-600">
              {item.name}
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: item.color }}
            >
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 캠페인 목표 한글 변환
const formatObjective = (objective: string): string => {
  const objectiveMap: Record<string, string> = {
    'OUTCOME_TRAFFIC': '트래픽',
    'OUTCOME_SALES': '판매',
    'OUTCOME_LEADS': '리드 생성',
    'OUTCOME_ENGAGEMENT': '참여',
    'OUTCOME_AWARENESS': '인지도',
    'OUTCOME_APP_PROMOTION': '앱 홍보',
    'LINK_CLICKS': '링크 클릭',
    'OFFSITE_CONVERSIONS': '전환',
    'POST_ENGAGEMENT': '게시물 참여',
    'VIDEO_VIEWS': '동영상 조회',
    'REACH': '도달',
    'BRAND_AWARENESS': '브랜드 인지도',
    'MESSAGES': '메시지',
    'CONVERSIONS': '전환',
    'PRODUCT_CATALOG_SALES': '카탈로그 판매',
    'STORE_VISITS': '매장 방문',
  };
  return objectiveMap[objective] || objective || '미설정';
};

export function AdsTab({ adData, dailyData, campaignList, profileData, loading, userId }: AdsTabProps) {
  // 캠페인 테이블 페이지네이션 및 필터
  const [hierarchyPage, setHierarchyPage] = useState(1);
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const [expandedAdSets, setExpandedAdSets] = useState<Set<string>>(new Set());
  const [campaignDetails, setCampaignDetails] = useState<Map<string, CampaignHierarchy>>(new Map());
  const [loadingCampaigns, setLoadingCampaigns] = useState<Set<string>>(new Set());
  const ITEMS_PER_PAGE = 5;

  // 캠페인 상세 조회 hook
  const { fetchDetail } = useCampaignDetail(userId);

  // 캠페인 목록 필터링 (상태 기준) + 생성일 기준 내림차순 정렬
  const filteredCampaignList = campaignList
    .filter(item => {
      const status = item.dashAdCampaign.effectiveStatus?.toUpperCase() || item.dashAdCampaign.status?.toUpperCase();
      if (campaignStatusFilter === 'all') return true;
      if (campaignStatusFilter === 'active') {
        return status === 'ACTIVE';
      } else {
        return status !== 'ACTIVE';
      }
    })
    .sort((a, b) => {
      // 생성일 기준 내림차순 정렬 (최신이 먼저)
      const dateA = a.dashAdCampaign.createdTime || '';
      const dateB = b.dashAdCampaign.createdTime || '';
      return dateB.localeCompare(dateA);
    });

  // 캠페인 상태별 개수
  const activeCampaignCount = campaignList.filter(item => {
    const status = item.dashAdCampaign.effectiveStatus?.toUpperCase() || item.dashAdCampaign.status?.toUpperCase();
    return status === 'ACTIVE';
  }).length;
  const endedCampaignCount = campaignList.length - activeCampaignCount;

  // 캠페인 확장/축소 토글 (클릭 시 상세 API 호출)
  const toggleCampaign = async (campaignId: string) => {
    // 이미 열려있으면 닫기만
    if (expandedCampaigns.has(campaignId)) {
      setExpandedCampaigns(prev => {
        const next = new Set(prev);
        next.delete(campaignId);
        return next;
      });
      return;
    }

    // 열기 - 캐시에 없으면 API 호출
    if (!campaignDetails.has(campaignId)) {
      setLoadingCampaigns(prev => new Set(prev).add(campaignId));

      const result = await fetchDetail(campaignId);

      setLoadingCampaigns(prev => {
        const next = new Set(prev);
        next.delete(campaignId);
        return next;
      });

      if (result?.campaignHierarchy) {
        setCampaignDetails(prev => new Map(prev).set(campaignId, result.campaignHierarchy!));
      }
    }

    // 확장 상태 토글
    setExpandedCampaigns(prev => new Set(prev).add(campaignId));
  };

  // 광고세트 확장/축소 토글
  const toggleAdSet = (adSetId: string) => {
    setExpandedAdSets(prev => {
      const next = new Set(prev);
      if (next.has(adSetId)) {
        next.delete(adSetId);
      } else {
        next.add(adSetId);
      }
      return next;
    });
  };

  // 유기적 vs 광고 데이터 계산
  const organicReach = profileData?.reach || 0;
  const adReach = adData?.reach || 0;
  const totalReach = organicReach + adReach;
  const adReachPercent = totalReach > 0 ? Math.round((adReach / totalReach) * 100) : 0;
  const organicReachPercent = totalReach > 0 ? 100 - adReachPercent : 0;

  const organicEngagement = (profileData?.profileViews || 0) + (profileData?.websiteClicks || 0);
  const adEngagement = adData?.clicks || 0;
  const totalEngagement = organicEngagement + adEngagement;
  const organicEngagementPercent = totalEngagement > 0 ? Math.round((organicEngagement / totalEngagement) * 100) : 0;
  const adEngagementPercent = totalEngagement > 0 ? 100 - organicEngagementPercent : 0;

  const reachSourceData = [
    { name: '광고 도달', value: adReachPercent, color: '#f59e0b' },
    { name: '유기적 도달', value: organicReachPercent, color: '#6366f1' },
  ];

  const engagementSourceData = [
    { name: '광고 참여', value: adEngagementPercent, color: '#f59e0b' },
    { name: '유기적 참여', value: organicEngagementPercent, color: '#6366f1' },
  ];
  if (!adData) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        데이터를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 콘텐츠 영역 */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPI Cards - 3개씩 2열 */}
          <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <AdKPICard
          title="총 광고 지출"
          value={formatCurrency(adData.spend)}
          change={adData.spendGrowth}
          isPositive={true}
          metricKey="spend"
          loading={loading}
        />
        <AdKPICard
          title="ROAS"
          value={adData.roas.toFixed(1) + 'x'}
          change={adData.roasGrowth}
          isPositive={adData.roasGrowth >= 0}
          metricKey="roas"
          loading={loading}
        />
        <AdKPICard
          title="총 광고 도달"
          value={formatNumber(adData.reach)}
          change={adData.reachGrowth}
          isPositive={adData.reachGrowth >= 0}
          metricKey="reach"
          loading={loading}
        />
        <AdKPICard
          title="총 광고 클릭"
          value={formatNumber(adData.clicks)}
          change={adData.clicksGrowth}
          isPositive={adData.clicksGrowth >= 0}
          metricKey="clicks"
          loading={loading}
        />
        <AdKPICard
          title="평균 CTR"
          value={adData.ctr.toFixed(1) + '%'}
          change={adData.ctrGrowth}
          isPositive={adData.ctrGrowth >= 0}
          metricKey="ctr"
          loading={loading}
        />
        <AdKPICard
          title="평균 CPC"
          value={'₩' + Math.round(adData.cpc).toLocaleString()}
          change={adData.cpcGrowth}
          isPositive={adData.cpcGrowth <= 0}
          metricKey="cpc"
          loading={loading}
        />
      </section>

      {/* 광고 캠페인별 성과 - 캠페인 목록 */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">광고 캠페인별 성과</h3>
          {campaignList.length > 0 && (
            <span className="text-sm text-slate-500">
              총 {filteredCampaignList.length}개 캠페인
            </span>
          )}
        </div>

        {/* 상태별 탭 필터 */}
        {campaignList.length > 0 && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setCampaignStatusFilter('active');
                setHierarchyPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                campaignStatusFilter === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              진행중
              <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
                campaignStatusFilter === 'active' ? 'bg-emerald-500' : 'bg-slate-200'
              }`}>
                {activeCampaignCount}
              </span>
            </button>
            <button
              onClick={() => {
                setCampaignStatusFilter('ended');
                setHierarchyPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                campaignStatusFilter === 'ended'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              종료됨
              <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
                campaignStatusFilter === 'ended' ? 'bg-slate-600' : 'bg-slate-200'
              }`}>
                {endedCampaignCount}
              </span>
            </button>
            <button
              onClick={() => {
                setCampaignStatusFilter('all');
                setHierarchyPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                campaignStatusFilter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              전체
              <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
                campaignStatusFilter === 'all' ? 'bg-primary-500' : 'bg-slate-200'
              }`}>
                {campaignList.length}
              </span>
            </button>
          </div>
        )}

        {/* 캠페인 목록이 있을 때 */}
        {filteredCampaignList.length > 0 ? (
          <>
            <div className="space-y-3">
              {filteredCampaignList
                .slice((hierarchyPage - 1) * ITEMS_PER_PAGE, hierarchyPage * ITEMS_PER_PAGE)
                .map((item) => {
                const campaign = item.dashAdCampaign;
                const campaignId = campaign.id;
                const isExpanded = expandedCampaigns.has(campaignId);
                const isLoading = loadingCampaigns.has(campaignId);
                const detail = campaignDetails.get(campaignId);
                const status = campaign.effectiveStatus?.toUpperCase() || campaign.status?.toUpperCase();
                return (
                  <div key={campaignId} className="border border-slate-200 rounded-xl overflow-hidden">
                    {/* 캠페인 헤더 (클릭 가능) */}
                    <div
                      onClick={() => toggleCampaign(campaignId)}
                      className="p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {isLoading ? (
                          <Loader2 size={18} className="text-slate-400 animate-spin flex-shrink-0" />
                        ) : (
                          <ChevronDown
                            size={18}
                            className={`text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? '' : '-rotate-90'}`}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-600 text-white">
                              캠페인
                            </span>
                            <span className="font-medium text-slate-900 truncate">{campaign.name}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                              status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-700'
                                : status === 'PAUSED'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {status === 'ACTIVE' ? '진행중' : status === 'PAUSED' ? '일시정지' : '종료'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 ml-14">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {formatObjective(campaign.objective)}
                            </span>
                            {campaign.createdTime && (
                              <span className="text-xs text-slate-400">
                                생성: {new Date(campaign.createdTime).toLocaleDateString('ko-KR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* 클릭하여 상세 보기 안내 (상세 데이터 없을 때) */}
                      {!detail && !isLoading && (
                        <div className="ml-7 text-xs text-slate-400">
                          클릭하여 광고세트/소재 상세 정보를 확인하세요
                        </div>
                      )}
                      {/* 성과 지표 그리드 (상세 데이터 있을 때) */}
                      {detail && (
                        <div className="grid grid-cols-6 gap-3 ml-7">
                          <div className="bg-white rounded-lg px-3 py-2 text-center">
                            <div className="text-xs text-slate-500 mb-0.5">지출</div>
                            <div className="font-semibold text-slate-800 text-sm">₩{detail.totalSpend.toLocaleString()}</div>
                          </div>
                          <div className="bg-white rounded-lg px-3 py-2 text-center">
                            <div className="text-xs text-slate-500 mb-0.5">ROAS</div>
                            <div className="font-semibold text-emerald-600 text-sm">{detail.roas.toFixed(1)}x</div>
                          </div>
                          <div className="bg-white rounded-lg px-3 py-2 text-center">
                            <div className="text-xs text-slate-500 mb-0.5">도달</div>
                            <div className="font-semibold text-slate-800 text-sm">{formatNumber(detail.totalReach)}</div>
                          </div>
                          <div className="bg-white rounded-lg px-3 py-2 text-center">
                            <div className="text-xs text-slate-500 mb-0.5">클릭</div>
                            <div className="font-semibold text-slate-800 text-sm">{formatNumber(detail.totalClicks)}</div>
                          </div>
                          <div className="bg-white rounded-lg px-3 py-2 text-center">
                            <div className="text-xs text-slate-500 mb-0.5">CTR</div>
                            <div className="font-semibold text-slate-800 text-sm">{detail.ctr.toFixed(2)}%</div>
                          </div>
                          <div className="bg-white rounded-lg px-3 py-2 text-center">
                            <div className="text-xs text-slate-500 mb-0.5">CPC</div>
                            <div className="font-semibold text-slate-800 text-sm">₩{Math.round(detail.cpc).toLocaleString()}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 광고세트 목록 (확장 시) */}
                    {isExpanded && detail && detail.adSets.length > 0 && (
                      <div className="border-t border-slate-200 bg-white">
                        <div className="px-4 py-2 bg-slate-100/50 border-b border-slate-100">
                          <span className="text-xs font-medium text-slate-500">광고세트 ({detail.adSets.length}개)</span>
                        </div>
                        {detail.adSets.map((adSet, idx) => {
                          const isAdSetExpanded = expandedAdSets.has(adSet.id);
                          return (
                          <div
                            key={adSet.id}
                            className={idx < detail.adSets.length - 1 ? 'border-b border-slate-100' : ''}
                          >
                            {/* 광고세트 헤더 (클릭 가능) */}
                            <div
                              onClick={() => toggleAdSet(adSet.id)}
                              className="p-4 hover:bg-slate-50 cursor-pointer"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <ChevronDown
                                      size={14}
                                      className={`text-slate-400 transition-transform flex-shrink-0 ${isAdSetExpanded ? '' : '-rotate-90'}`}
                                    />
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-cyan-600 text-white flex-shrink-0">
                                      광고세트
                                    </span>
                                    <span className="text-sm font-medium text-slate-700 truncate">{adSet.name}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                                      adSet.status.toUpperCase() === 'ACTIVE'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : adSet.status.toUpperCase() === 'PAUSED'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {adSet.status.toUpperCase() === 'ACTIVE' ? '진행중' : adSet.status.toUpperCase() === 'PAUSED' ? '일시정지' : adSet.status}
                                    </span>
                                    {adSet.ads && adSet.ads.length > 0 && (
                                      <span className="text-xs text-slate-400">
                                        (소재 {adSet.ads.length}개)
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-500 ml-5">
                                    예산: {adSet.dailyBudget ? `₩${parseInt(adSet.dailyBudget).toLocaleString()}/일` : adSet.lifetimeBudget ? `₩${parseInt(adSet.lifetimeBudget).toLocaleString()} (전체)` : '-'}
                                    {adSet.optimizationGoal && ` • ${formatObjective(adSet.optimizationGoal)}`}
                                  </div>
                                </div>
                              </div>
                              {/* 광고세트 성과 지표 */}
                              <div className="grid grid-cols-6 gap-2 mt-3 ml-5">
                                <div className="text-center">
                                  <div className="text-xs text-slate-400">지출</div>
                                  <div className="text-sm text-slate-600">₩{adSet.spend.toLocaleString()}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-slate-400">ROAS</div>
                                  <div className="text-sm text-emerald-600 font-medium">{adSet.roas.toFixed(1)}x</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-slate-400">도달</div>
                                  <div className="text-sm text-slate-600">{formatNumber(adSet.reach)}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-slate-400">클릭</div>
                                  <div className="text-sm text-slate-600">{formatNumber(adSet.clicks)}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-slate-400">CTR</div>
                                  <div className="text-sm text-slate-600">{adSet.ctr.toFixed(2)}%</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-slate-400">CPC</div>
                                  <div className="text-sm text-slate-600">₩{Math.round(adSet.cpc).toLocaleString()}</div>
                                </div>
                              </div>
                            </div>

                            {/* 소재 목록 (확장 시) */}
                            {isAdSetExpanded && adSet.ads && adSet.ads.length > 0 && (
                              <div className="bg-slate-50/50 border-t border-slate-100">
                                <div className="px-4 py-2 bg-slate-100/30 border-b border-slate-100 ml-5">
                                  <span className="text-xs font-medium text-slate-400">소재 ({adSet.ads.length}개)</span>
                                </div>
                                {adSet.ads.map((ad, adIdx) => (
                                  <div
                                    key={ad.id || adIdx}
                                    className={`p-3 ml-5 ${adIdx < adSet.ads.length - 1 ? 'border-b border-slate-100' : ''}`}
                                  >
                                    <div className="flex items-start gap-3">
                                      {/* 썸네일 */}
                                      <div className="flex-shrink-0">
                                        {ad.thumbnailUrl || ad.imageUrl ? (
                                          <img
                                            src={getProxiedImageUrl(ad.thumbnailUrl || ad.imageUrl)}
                                            alt={ad.adName}
                                            referrerPolicy="no-referrer"
                                            className="w-12 h-12 object-cover rounded-lg bg-slate-200"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="%23e2e8f0"><rect width="48" height="48"/></svg>';
                                            }}
                                          />
                                        ) : (
                                          <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
                                            <span className="text-slate-400 text-xs">No img</span>
                                          </div>
                                        )}
                                      </div>
                                      {/* 소재 정보 */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-600 text-white flex-shrink-0">
                                            소재
                                          </span>
                                          <span className="text-sm font-medium text-slate-700 truncate">{ad.adName || '이름 없음'}</span>
                                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                            ad.status.toUpperCase() === 'ACTIVE'
                                              ? 'bg-emerald-100 text-emerald-700'
                                              : ad.status.toUpperCase() === 'PAUSED'
                                              ? 'bg-amber-100 text-amber-700'
                                              : 'bg-slate-100 text-slate-600'
                                          }`}>
                                            {ad.status.toUpperCase() === 'ACTIVE' ? '진행' : ad.status.toUpperCase() === 'PAUSED' ? '정지' : ad.status}
                                          </span>
                                        </div>
                                        {ad.message && (
                                          <p className="text-xs text-slate-500 line-clamp-1 mb-2">{ad.message}</p>
                                        )}
                                        {/* 소재 성과 지표 */}
                                        <div className="flex flex-wrap gap-4 text-xs">
                                          <span className="text-slate-500">지출 <span className="text-slate-700 font-medium">₩{ad.spend.toLocaleString()}</span></span>
                                          <span className="text-slate-500">ROAS <span className="text-emerald-600 font-medium">{ad.roas.toFixed(1)}x</span></span>
                                          <span className="text-slate-500">도달 <span className="text-slate-700 font-medium">{formatNumber(ad.reach)}</span></span>
                                          <span className="text-slate-500">클릭 <span className="text-slate-700 font-medium">{formatNumber(ad.clicks)}</span></span>
                                          <span className="text-slate-500">CTR <span className="text-slate-700 font-medium">{ad.ctr.toFixed(2)}%</span></span>
                                          <span className="text-slate-500">CPC <span className="text-slate-700 font-medium">₩{Math.round(ad.cpc).toLocaleString()}</span></span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 소재 없음 */}
                            {isAdSetExpanded && (!adSet.ads || adSet.ads.length === 0) && (
                              <div className="p-3 ml-5 text-xs text-slate-400 bg-slate-50/50 border-t border-slate-100 text-center">
                                소재가 없습니다.
                              </div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 광고세트 없음 */}
                    {isExpanded && detail && detail.adSets.length === 0 && (
                      <div className="p-4 text-sm text-slate-500 bg-white border-t border-slate-200 text-center">
                        광고세트가 없습니다.
                      </div>
                    )}
                    {/* 상세 데이터 로딩 중 */}
                    {isExpanded && !detail && isLoading && (
                      <div className="p-4 text-sm text-slate-500 bg-white border-t border-slate-200 text-center flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        광고세트 정보를 불러오는 중...
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 페이지네이션 */}
            {filteredCampaignList.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-500">
                  총 {filteredCampaignList.length}개 중 {(hierarchyPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(hierarchyPage * ITEMS_PER_PAGE, filteredCampaignList.length)}개 표시
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHierarchyPage(p => Math.max(1, p - 1))}
                    disabled={hierarchyPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.ceil(filteredCampaignList.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setHierarchyPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        hierarchyPage === page
                          ? 'bg-primary-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setHierarchyPage(p => Math.min(Math.ceil(filteredCampaignList.length / ITEMS_PER_PAGE), p + 1))}
                    disabled={hierarchyPage === Math.ceil(filteredCampaignList.length / ITEMS_PER_PAGE)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">
            등록된 캠페인이 없습니다.
          </div>
        )}
      </section>

      {/* Main Performance Chart */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">일별 광고 성과</h3>
            <InfoTooltip metricKey="spend" />
          </div>
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-violet-300" />
              <span className="text-slate-600">지출</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary-500" />
              <span className="text-slate-600">클릭</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => '₩' + (v / 1000).toFixed(0) + 'K'} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  padding: '12px',
                }}
                formatter={(value: number, name: string) => {
                  if (name === '지출') return [formatCurrency(value), name];
                  return [formatNumber(value), name];
                }}
              />
              <Bar yAxisId="left" dataKey="spend" fill="#a78bfa" name="지출" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="clicks"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: '#2563eb', r: 5, strokeWidth: 2, stroke: '#fff' }}
                name="클릭"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CTR Trend */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-lg font-semibold text-slate-900">CTR 추이</h3>
            <InfoTooltip metricKey="ctr" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => v + '%'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [value.toFixed(2) + '%', 'CTR']}
                />
                <Line
                  type="monotone"
                  dataKey="ctr"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Clicks */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-lg font-semibold text-slate-900">일별 클릭</h3>
            <InfoTooltip metricKey="clicks" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={formatNumber} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [formatNumber(value), '클릭']}
                />
                <Bar dataKey="clicks" fill="#2563eb" name="clicks" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* 유기적 vs 광고 성과 비교 */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">유기적 vs 광고 성과 비교</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SourcePieChart title="도달 출처" data={reachSourceData} metricKey="reachSource" />
          <SourcePieChart title="참여 출처" data={engagementSourceData} metricKey="engagementSource" />
        </div>
      </section>

      </div>

      {/* AI 분석 사이드바 */}
      <div className="lg:col-span-1">
        <div className="bg-gradient-to-br from-primary-950 to-primary-900 rounded-2xl shadow-sm p-6 text-white sticky top-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-white/10 rounded-xl">
              <Sparkles size={20} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold">AI 광고 분석</h3>
          </div>

          <p className="text-primary-100 text-sm leading-relaxed mb-5 pb-5 border-b border-primary-800">
            {adAIAnalysis.summary}
          </p>

          <div className="space-y-3 mb-5">
            {adAIAnalysis.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary-300">{index + 1}</span>
                </div>
                <p className="text-sm text-primary-200 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <div className="text-xs font-semibold text-amber-400 mb-1">💡 추천 액션</div>
            <p className="text-sm text-amber-100/90 leading-relaxed">{adAIAnalysis.recommendation}</p>
          </div>

          <div className="mt-4 text-xs text-primary-400">
            마지막 업데이트: {new Date(adAIAnalysis.generatedAt).toLocaleString('ko-KR')}
          </div>
        </div>
      </div>
    </div>
  );
}
