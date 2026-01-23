import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProfilePage } from '../pages/dashboard/ProfilePage';
import { AdsPage } from '../pages/dashboard/AdsPage';
import { AdCampaignDetailPage } from '../pages/dashboard/ads/AdCampaignDetailPage';
import { AdSetDetailPage } from '../pages/dashboard/ads/AdSetDetailPage';
import { CampaignPage } from '../pages/dashboard/CampaignPage';
import { CampaignDetailPage } from '../pages/dashboard/campaign/CampaignDetailPage';
import { InfluencersPage } from '../pages/dashboard/InfluencersPage';
import { InfluencerDetailPage } from '../pages/dashboard/influencers/InfluencerDetailPage';

export const router = createBrowserRouter([
  // 루트 경로 → 대시보드로 리다이렉트
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // 공개 라우트 (미인증 사용자만)
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },

  // 보호된 라우트 (인증 필요)
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      // 기본 경로 → profile로 리다이렉트
      {
        index: true,
        element: <Navigate to="profile" replace />,
      },
      // 프로필 인사이트
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      // 광고 성과
      {
        path: 'ads',
        element: <AdsPage />,
      },
      {
        path: 'ads/campaigns/:campaignId',
        element: <AdCampaignDetailPage />,
      },
      {
        path: 'ads/campaigns/:campaignId/adsets/:adSetId',
        element: <AdSetDetailPage />,
      },
      // 캠페인 관리
      {
        path: 'campaign',
        element: <CampaignPage />,
      },
      {
        path: 'campaign/:campaignId',
        element: <CampaignDetailPage />,
      },
      // 인플루언서 리스트
      {
        path: 'influencers',
        element: <InfluencersPage />,
      },
      {
        path: 'influencers/:influencerId',
        element: <InfluencerDetailPage />,
      },
    ],
  },

  // 404 처리 → 대시보드로 리다이렉트
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
