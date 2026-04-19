import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import EmptyState from './EmptyState';

type PermissionGateProps = {
  children: ReactNode;
  adminOnly?: boolean;
  requireAuth?: boolean;
  fallback?: ReactNode;
};

export default function PermissionGate({
  children,
  adminOnly = false,
  requireAuth = false,
  fallback,
}: PermissionGateProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const denied = (requireAuth && !isAuthenticated) || (adminOnly && !isAdmin);

  if (!denied) return children;

  return (
    fallback ?? (
      <EmptyState
        title="Bạn chưa có quyền thực hiện thao tác này"
        description="Hãy đăng nhập bằng tài khoản phù hợp để tiếp tục."
      />
    )
  );
}
