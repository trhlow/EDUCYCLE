import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  IconMessageCircle,
  IconPlus,
  IconSearch,
  IconStorefront,
} from '../icons/Icons';

const ACTIONS = [
  { to: '/', label: 'Trang chủ', icon: IconStorefront, end: true },
  { to: '/products', label: 'Khám phá', icon: IconSearch },
  { to: '/products/new', label: 'Đăng tin', icon: IconPlus },
  { to: '/transactions', label: 'Giao dịch', icon: IconMessageCircle },
];

export default function MobileQuickActions() {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || isAdmin) return null;

  return (
    <nav className="mobile-quick-actions" aria-label="Lối tắt nhanh">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <NavLink
            key={action.to}
            to={action.to}
            end={action.end}
            className={({ isActive }) =>
              `mobile-quick-actions__item ${isActive ? 'active' : ''}`.trim()
            }
          >
            <Icon size={20} />
            <span>{action.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

