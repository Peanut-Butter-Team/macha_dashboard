import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

export function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'performance';

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  // TODO: 캠페인 데이터 로딩
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
          onClick={() => navigate('/dashboard/campaign')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">캠페인 상세</h1>
          <p className="text-slate-500 text-sm">캠페인 ID: {campaignId}</p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6">
        {[
          { key: 'performance', label: '캠페인 성과' },
          { key: 'seeding', label: '참여 인플루언서' },
          { key: 'content', label: '콘텐츠 갤러리' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {activeTab === 'performance' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">캠페인 성과</h2>
            <p className="text-slate-500">캠페인 성과 데이터가 여기에 표시됩니다.</p>
          </div>
        )}
        {activeTab === 'seeding' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">참여 인플루언서</h2>
            <p className="text-slate-500">참여 인플루언서 목록이 여기에 표시됩니다.</p>
          </div>
        )}
        {activeTab === 'content' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">콘텐츠 갤러리</h2>
            <p className="text-slate-500">콘텐츠 갤러리가 여기에 표시됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
