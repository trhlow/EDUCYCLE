import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../../components/ui';

export function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState label="Đang kiểm tra phiên đăng nhập..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState label="Đang kiểm tra phiên đăng nhập..." />;
  }

  // Cho phép mở /auth?resetToken=... kể cả khi đã đăng nhập (link từ email quên mật khẩu)
  const resetFromEmail = new URLSearchParams(location.search).has('resetToken');
  if (isAuthenticated && !resetFromEmail) {
    const from = location.state?.from?.pathname || '/products';
    return <Navigate to={from} replace />;
  }

  return children;
}

