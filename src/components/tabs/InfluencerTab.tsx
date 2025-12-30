import { useState } from 'react';
import {
  Search,
  Instagram,
  Users,
  Heart,
  Plus,
  CheckCircle2,
  X,
  Megaphone,
} from 'lucide-react';
import type { Influencer } from '../../types';

// 캠페인 목록 데이터 (CampaignTab과 동일)
interface CampaignOption {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'paused' | 'completed';
}

const campaignOptions: CampaignOption[] = [
  { id: '1', name: '스웻이프', category: '크로스핏/...', status: 'active' },
];

interface InfluencerTabProps {
  influencers: Influencer[] | null;
  loading: boolean;
  onAddToCampaign?: (influencer: Influencer, campaignId: string) => void;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

// Platform Badge (Instagram only)
function PlatformBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
      <Instagram size={12} className="text-white" />
      <span className="text-[10px] font-semibold text-white">Instagram</span>
    </div>
  );
}

export function InfluencerTab({ influencers, loading, onAddToCampaign }: InfluencerTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);

  if (loading || !influencers) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        데이터를 불러오는 중...
      </div>
    );
  }

  // 인스타그램 인플루언서만 필터링
  const instagramInfluencers = influencers.filter((inf) => inf.platform === 'instagram');

  const allCategories = [...new Set(instagramInfluencers.flatMap((i) => i.category))];

  const filteredInfluencers = instagramInfluencers.filter((inf) => {
    const matchesSearch =
      inf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inf.handle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || inf.category.includes(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const handleOpenCampaignModal = (influencer: Influencer) => {
    setSelectedInfluencer(influencer);
    setShowCampaignModal(true);
  };

  const handleSelectCampaign = (campaign: CampaignOption) => {
    if (selectedInfluencer) {
      // 실제로 캠페인에 인플루언서 추가
      if (onAddToCampaign) {
        onAddToCampaign(selectedInfluencer, campaign.id);
      }
      alert(`${selectedInfluencer.name}님을 "${campaign.name}" 캠페인에 추가했습니다.`);
      setShowCampaignModal(false);
      setSelectedInfluencer(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-primary-950 mb-4">인플루언서 검색</h3>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="이름 또는 핸들로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
          >
            <option value="all">모든 카테고리</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {filteredInfluencers.map((inf) => (
            <div
              key={inf.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={inf.thumbnail}
                  alt={inf.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary-950">{inf.name}</span>
                    {inf.verified && (
                      <CheckCircle2 size={14} className="text-blue-500" fill="currentColor" />
                    )}
                    <PlatformBadge />
                  </div>
                  <div className="text-sm text-slate-500">{inf.handle}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {formatNumber(inf.followers)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={12} /> {inf.engagementRate}%
                    </span>
                    <span>{inf.priceRange}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleOpenCampaignModal(inf)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <Plus size={14} />
                캠페인 추가
              </button>
            </div>
          ))}
          {filteredInfluencers.length === 0 && (
            <div className="text-center py-8 text-slate-500">검색 결과가 없습니다.</div>
          )}
        </div>
      </div>

      {/* 캠페인 선택 모달 */}
      {showCampaignModal && selectedInfluencer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary-950">캠페인 선택</h3>
              <button
                onClick={() => {
                  setShowCampaignModal(false);
                  setSelectedInfluencer(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              <span className="font-medium text-primary-700">{selectedInfluencer.name}</span>님을 추가할 캠페인을 선택하세요.
            </p>

            <div className="space-y-2">
              {campaignOptions.map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() => handleSelectCampaign(campaign)}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-primary-50 hover:border-primary-200 border border-transparent transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Megaphone size={18} className="text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-primary-950">{campaign.name}</div>
                    <div className="text-xs text-slate-500">{campaign.category}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    campaign.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : campaign.status === 'paused'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {campaign.status === 'active' ? '진행중' : campaign.status === 'paused' ? '일시중지' : '완료'}
                  </span>
                </button>
              ))}
            </div>

            {campaignOptions.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                등록된 캠페인이 없습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
