import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  children: ReactNode;
}

// 공개 라우트 (로그인/회원가입) - 이미 인증된 경우 대시보드로 리다이렉트
export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // 이미 인증된 경우 대시보드로 리다이렉트
  // 원래 가려던 경로가 있으면 그곳으로
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
