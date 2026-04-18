import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { IconBell, IconMenu, IconMoon, IconSun, IconX } from '../icons/Icons';
import EduCycleLogo from '../branding/EduCycleLogo';
import NavbarCatalog from './NavbarCatalog';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, resolveNotifRoute } = useNotifications();
  const notifList = Array.isArray(notifications) ? notifications : [];
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setNotifOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const handleNotifClick = (n) => {
    if (!n.read) markAsRead(n.id);
    setNotifOpen(false);
    navigate(resolveNotifRoute(n));
  };

  const catalogActive = location.pathname === '/products' && searchParams.has('category');

  const goCatalog = useCallback((category, query) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    const trimmed = query != null ? String(query).trim() : '';
    if (trimmed) params.set('q', trimmed);
    const qs = params.toString();
    navigate({ pathname: '/products', search: qs ? `?${qs}` : '' });
    setMenuOpen(false);
  }, [navigate]);

  const userInitial = (() => {
    const u = user?.username;
    if (!u || typeof u !== 'string') return '?';
    const ch = u.charAt(0);
    return ch ? ch.toUpperCase() : '?';
  })();

  return (
    <nav className="navbar">
      {menuOpen && (
        <button
          type="button"
          className="navbar-backdrop"
          aria-label="Đóng menu điều hướng"
          tabIndex={-1}
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" aria-label="EduCycle — về trang chủ">
          <EduCycleLogo size={38} className="navbar-brand-logo" />
          <span className="navbar-brand-text">EduCycle</span>
        </Link>

        <button type="button" className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}>
          {menuOpen ? <IconX size={22} /> : <IconMenu size={22} />}
        </button>

        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          {isAdmin ? (
            <>
              <NavLink to="/admin" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                Quản trị
              </NavLink>
              <NavbarCatalog mode="desktop" onPick={goCatalog} catalogActive={catalogActive} />
              <NavbarCatalog mode="mobile" onPick={goCatalog} catalogActive={catalogActive} />
            </>
          ) : (
            <>
              <NavbarCatalog mode="desktop" onPick={goCatalog} catalogActive={catalogActive} />
              <NavbarCatalog mode="mobile" onPick={goCatalog} catalogActive={catalogActive} />
              {isAuthenticated && (
                <NavLink to="/products/new" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  Đăng bán
                </NavLink>
              )}
              {!isAuthenticated && (
                <NavLink to="/transactions/guide" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  Hướng dẫn
                </NavLink>
              )}
            </>
          )}
        </div>

        <div className="navbar-actions">
          <button
            type="button"
            className={`navbar-icon-btn navbar-theme-btn ${isDark ? 'active' : ''}`}
            onClick={toggleTheme}
            aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            title={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          >
            {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
          </button>

          {isAuthenticated && (
            <div className="navbar-notif-menu" ref={notifMenuRef}>
              <button type="button" className="navbar-icon-btn navbar-notif-btn" onClick={() => setNotifOpen(!notifOpen)} aria-label="Thông báo" title="Thông báo">
                <IconBell size={22} />
                {unreadCount > 0 && <span className="navbar-notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </button>
              {notifOpen && (
                <div className="navbar-notif-dropdown">
                  <div className="navbar-notif-header">
                    <span className="navbar-notif-title">Thông báo</span>
                    {unreadCount > 0 && (
                      <button type="button" className="navbar-notif-mark-all" onClick={() => markAllAsRead()}>
                        Đánh dấu tất cả đã đọc
                      </button>
                    )}
                  </div>
                  <div className="navbar-notif-list">
                    {notifList.length === 0 ? (
                      <div className="navbar-notif-empty">Không có thông báo</div>
                    ) : (
                      notifList.slice(0, 20).map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className={`navbar-notif-item ${!n.read ? 'unread' : ''}`}
                          onClick={() => handleNotifClick(n)}
                          aria-label={`${!n.read ? 'Chưa đọc: ' : ''}${n.title ?? 'Thông báo'}`}
                        >
                          <div className="navbar-notif-item-title">{n.title}</div>
                          <div className="navbar-notif-item-msg">{n.message}</div>
                          <div className="navbar-notif-item-time">{n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}</div>
                        </button>
                      ))
                    )}
                  </div>
                  {notifList.length > 20 && (
                    <div className="navbar-notif-more">Hiển thị 20 thông báo gần nhất · tổng {notifList.length}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {isAuthenticated ? (
            <div className="navbar-user-menu" ref={userMenuRef}>
              <button type="button" className="navbar-user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <span className="navbar-user-avatar">{userInitial}</span>
                <span className="navbar-user-name">{user?.username}</span>
              </button>
              {userMenuOpen && (
                <div className="navbar-dropdown">
                  {isAdmin ? (
                    <>
                      <Link to="/admin" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        Quản trị
                      </Link>
                      <div className="navbar-dropdown-divider" />
                    </>
                  ) : (
                    <>
                      <Link to="/profile" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        Hồ sơ
                      </Link>
                      <Link to="/products/new" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        Đăng bán
                      </Link>
                      <Link to="/transactions" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        Giao dịch
                      </Link>
                      <div className="navbar-dropdown-divider" />
                    </>
                  )}
                  <button type="button" className="navbar-dropdown-item navbar-dropdown-logout" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth">
              <button type="button" className="navbar-auth-btn">
                Đăng nhập
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

