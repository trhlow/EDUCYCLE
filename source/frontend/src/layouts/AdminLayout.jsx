import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiPackage, FiDollarSign,
  FiTag, FiLogOut, FiArrowLeft, FiMenu, FiX
} from 'react-icons/fi';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/admin', icon: FiGrid, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: FiUsers, label: 'Users' },
  { to: '/admin/products', icon: FiPackage, label: 'Products' },
  { to: '/admin/transactions', icon: FiDollarSign, label: 'Transactions' },
  { to: '/admin/categories', icon: FiTag, label: 'Categories' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎓</span>
              <span className="font-display text-lg font-bold text-white">
                EduCycle Admin
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-400 cursor-pointer"
            >
              <FiX size={20} />
            </button>
          </div>

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
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-800 space-y-1">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 no-underline"
            >
              <FiArrowLeft size={18} />
              Back to Store
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-gray-800 w-full cursor-pointer"
            >
              <FiLogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 text-gray-600 cursor-pointer"
          >
            <FiMenu size={24} />
          </button>
          <span className="font-display font-bold text-gray-900">Admin Panel</span>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
