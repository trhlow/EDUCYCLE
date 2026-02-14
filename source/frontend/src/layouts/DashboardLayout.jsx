import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiPackage, FiPlusCircle, FiShoppingBag,
  FiUser, FiLogOut, FiArrowLeft, FiMenu, FiX
} from 'react-icons/fi';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/dashboard', icon: FiGrid, label: 'Overview', end: true },
  { to: '/dashboard/products', icon: FiPackage, label: 'My Products' },
  { to: '/dashboard/products/new', icon: FiPlusCircle, label: 'Add Product' },
  { to: '/dashboard/purchases', icon: FiShoppingBag, label: 'Purchases' },
  { to: '/dashboard/profile', icon: FiUser, label: 'Profile' },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎓</span>
              <span className="font-display text-lg font-bold text-primary-500">
                EduCycle
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-500 cursor-pointer"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-gray-500">{user?.role || 'User'}</p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-1">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 no-underline"
            >
              <FiArrowLeft size={18} />
              Back to Store
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full cursor-pointer"
            >
              <FiLogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar for mobile */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 text-gray-600 cursor-pointer"
          >
            <FiMenu size={24} />
          </button>
          <span className="font-display font-bold text-primary-500">Dashboard</span>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
