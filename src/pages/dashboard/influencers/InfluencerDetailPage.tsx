import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Instagram, Users, Image, Film } from 'lucide-react';

export function InfluencerDetailPage() {
  const { influencerId } = useParams<{ influencerId: string }>();
  const navigate = useNavigate();

  // TODO: 인플루언서 데이터 로딩
  const loading = false;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/dashboard/influencers')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">인플루언서 상세</h1>
          <p className="text-slate-500 text-sm">인플루언서 ID: {influencerId}</p>
        </div>
      </div>

      {/* 프로필 카드 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center">
            <Users size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">인플루언서 이름</h2>
            <div className="flex items-center gap-2 text-slate-500 mt-1">
              <Instagram size={16} />
              <span>@username</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">-</p>
            <p className="text-sm text-slate-500">팔로워</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">-</p>
            <p className="text-sm text-slate-500">게시물</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">-</p>
            <p className="text-sm text-slate-500">참여율</p>
          </div>
        </div>
      </div>

      {/* 콘텐츠 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 피드 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Image size={20} className="text-slate-600" />
            <h3 className="text-lg font-semibold">피드 콘텐츠</h3>
          </div>
          <p className="text-slate-500 text-center py-8">
            피드 콘텐츠가 여기에 표시됩니다.
          </p>
        </div>

        {/* 릴스 */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Film size={20} className="text-slate-600" />
            <h3 className="text-lg font-semibold">릴스 콘텐츠</h3>
          </div>
          <p className="text-slate-500 text-center py-8">
            릴스 콘텐츠가 여기에 표시됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
