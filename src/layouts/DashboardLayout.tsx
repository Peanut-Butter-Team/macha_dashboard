import { Outlet, NavLink } from 'react-router-dom';
import { BarChart3, User, TrendingUp, Megaphone, Instagram, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useChannelTalk } from '../hooks/useChannelTalk';

// 탭 설정
const tabs = [
  { path: '/dashboard/profile', label: '프로필 인사이트', icon: User },
  { path: '/dashboard/ads', label: '광고 성과', icon: TrendingUp },
  { path: '/dashboard/campaign', label: '캠페인 관리', icon: Megaphone },
  { path: '/dashboard/influencers', label: '인플루언서 리스트', icon: User },
];

export function DashboardLayout() {
  const { user, logout, isAuthenticated } = useAuth();

  // 채널톡 초기화
  useChannelTalk(user, isAuthenticated);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-primary-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Logo & User Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <BarChart3 size={22} className="text-white" />
                </div>
                <span className="font-bold text-xl">Wellink</span>
              </div>
              <div className="h-8 w-px bg-primary-700" />
              <div>
                <div className="text-primary-300 text-sm">{user?.managerName || user?.email}</div>
                <div className="font-semibold">{user?.name || user?.email}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Instagram Connect Button */}
              <button
                onClick={() => {
                  const stateObj = {
                    redirectUrl: window.location.origin,
                    dashMemberId: user?.id,
                  };
                  const encodedState = encodeURIComponent(JSON.stringify(stateObj));

                  const url =
                    'https://www.facebook.com/v24.0/dialog/oauth' +
                    '?client_id=742315354931014' +
                    '&redirect_uri=https://matcha.pnutbutter.kr/api-meta/auth/callback' +
                    '&state=' +
                    encodedState +
                    '&scope=' +
                    [
                      'public_profile',
                      'pages_show_list',
                      'pages_read_engagement',
                      'instagram_basic',
                      'instagram_manage_insights',
                      'business_management',
                      'ads_read',
                      'ads_management',
                    ].join(',') +
                    '&response_type=code' +
                    '&auth_type=rerequest' +
                    '&enable_profile_selector=true';
                  window.location.href = url;
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-white text-xs transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #f58529, #dd2a7b, #8134af)',
                }}
              >
                <Instagram size={14} />
                Instagram 연결
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-primary-300 hover:text-white hover:bg-primary-800 rounded-lg transition-colors"
                title="로그아웃"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">로그아웃</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation - NavLink 사용 */}
          <nav className="mt-6 flex items-center gap-1 bg-primary-900/50 rounded-xl p-1.5">
            {tabs.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-primary-950 shadow-sm'
                      : 'text-primary-300 hover:text-white hover:bg-primary-800'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content - Outlet으로 자식 라우트 렌더링 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div>
            © 2026 Wellink Dashboard. 데이터는 Instagram Graph API, Meta Ads API, 내부 DB와 실시간 연동됩니다.
          </div>
          <div className="flex items-center gap-4">
            <span>문의: support@wellink.io</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
