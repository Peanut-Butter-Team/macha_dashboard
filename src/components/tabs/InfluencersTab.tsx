import { useState, useEffect } from 'react';
import { Loader2, Search, Filter, Users, Instagram, ExternalLink, Heart, MessageCircle } from 'lucide-react';
import { fetchDashInfluencers, fetchDashInfluencerDetail } from '../../services/metaDashApi';
import type { DashInfluencer, DashInfluencerDetailResponse } from '../../types/metaDash';

// 인플루언서 카드 컴포넌트
function InfluencerCard({ influencer }: { influencer: DashInfluencer }) {
  const [detail, setDetail] = useState<DashInfluencerDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setDetailLoading(true);
        const data = await fetchDashInfluencerDetail(influencer.id);
        setDetail(data);
      } catch (err) {
        console.error('[InfluencerCard] 상세 로드 실패:', err);
      } finally {
        setDetailLoading(false);
      }
    };

    loadDetail();
  }, [influencer.id]);

  // 숫자 포맷팅
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // 최근 게시물 (최대 10개)
  const latestPosts = detail?.dashInfluencerDetail?.latestPosts?.slice(0, 10) || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* 상단: 프로필 영역 */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-4">
          {/* 프로필 이미지 */}
          <div className="flex-shrink-0">
            {influencer.profileImage ? (
              <img
                src={influencer.profileImage}
                alt={influencer.name}
                className="w-16 h-16 rounded-full object-cover bg-slate-100 ring-2 ring-slate-100"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold ring-2 ring-slate-100 ${influencer.profileImage ? 'hidden' : ''}`}
            >
              {influencer.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* 프로필 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-900 text-lg truncate">{influencer.name}</h3>
              {detail?.dashInfluencerDetail?.verified && (
                <span className="text-blue-500">✓</span>
              )}
            </div>

            {/* 인스타그램 핸들 (클릭 시 프로필 이동) */}
            {influencer.handle && (
              <a
                href={`https://instagram.com/${influencer.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-pink-600 transition-colors"
              >
                <Instagram size={14} />
                <span>@{influencer.handle}</span>
                <ExternalLink size={12} />
              </a>
            )}

            {/* 팔로워 & 참여율 배지 */}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm font-semibold text-slate-700">
                {formatNumber(influencer.followers)} 팔로워
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                ER {influencer.engagementRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* 소개글 (biography) */}
        {detail?.dashInfluencerDetail?.biography && (
          <p className="mt-3 text-sm text-slate-600 line-clamp-2">
            {detail.dashInfluencerDetail.biography}
          </p>
        )}
      </div>

      {/* 중단: 최근 콘텐츠 미리보기 (10개 썸네일) */}
      <div className="p-4 bg-slate-50">
        <div className="text-xs font-semibold text-slate-500 mb-2">최근 콘텐츠</div>

        {detailLoading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : latestPosts.length > 0 ? (
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {latestPosts.map((post, idx) => (
              <a
                key={post.id || idx}
                href={post.url || `https://instagram.com/p/${post.shortCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 group relative"
              >
                <img
                  src={post.displayUrl || post.images?.[0]}
                  alt={`Post ${idx + 1}`}
                  className="w-16 h-16 object-cover rounded-lg bg-slate-200 group-hover:opacity-80 transition-opacity"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="%23e2e8f0"><rect width="64" height="64"/></svg>';
                  }}
                />
                {/* 호버 시 좋아요/댓글 수 표시 */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div className="text-white text-[10px] text-center">
                    <div className="flex items-center gap-0.5">
                      <Heart size={10} fill="white" />
                      <span>{formatNumber(post.likesCount || 0)}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <MessageCircle size={10} fill="white" />
                      <span>{formatNumber(post.commentsCount || 0)}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 text-sm py-4">
            콘텐츠 데이터 없음
          </div>
        )}
      </div>

      {/* 하단: 주요 지표 */}
      <div className="p-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-slate-500 mb-1">평균 좋아요</div>
          <div className="font-bold text-slate-900 flex items-center justify-center gap-1">
            <Heart size={14} className="text-red-500" />
            {formatNumber(influencer.avgLikes)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">평균 댓글</div>
          <div className="font-bold text-slate-900 flex items-center justify-center gap-1">
            <MessageCircle size={14} className="text-blue-500" />
            {formatNumber(influencer.avgComments)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">게시물</div>
          <div className="font-bold text-slate-900">
            {detail?.dashInfluencerDetail?.postsCount
              ? formatNumber(detail.dashInfluencerDetail.postsCount)
              : '-'}
          </div>
        </div>
      </div>
    </div>
  );
}

// 메인 컴포넌트
export function InfluencersTab() {
  const [influencers, setInfluencers] = useState<DashInfluencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const loadInfluencers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDashInfluencers();
        setInfluencers(data);
      } catch (err) {
        console.error('[InfluencersTab] 데이터 로드 실패:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setLoading(false);
      }
    };

    loadInfluencers();
  }, []);

  // 검색 및 필터링
  const filteredInfluencers = influencers.filter((inf) => {
    const matchesSearch =
      inf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inf.handle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || inf.category.includes(categoryFilter);

    return matchesSearch && matchesCategory;
  });

  // 카테고리 목록 추출
  const allCategories = Array.from(
    new Set(influencers.flatMap((inf) => inf.category))
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-primary-600" />
        <span className="text-slate-500">인플루언서 데이터 로딩 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">데이터 로드 실패</div>
          <div className="text-slate-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-950">인플루언서 리스트</h2>
            <p className="text-sm text-slate-500">총 {influencers.length}명의 인플루언서</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="이름 또는 핸들로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            >
              <option value="all">전체 카테고리</option>
              {allCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Influencers Grid (Card View) */}
      {filteredInfluencers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredInfluencers.map((influencer) => (
            <InfluencerCard key={influencer.id} influencer={influencer} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <Users size={48} className="mx-auto text-slate-300 mb-3" />
          <div className="text-lg font-semibold text-slate-700 mb-1">인플루언서가 없습니다</div>
          <div className="text-sm text-slate-500">검색 조건을 변경해보세요</div>
        </div>
      )}
    </div>
  );
}
