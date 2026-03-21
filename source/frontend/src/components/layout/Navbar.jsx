import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const notifList = Array.isArray(notifications) ? notifications : [];
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={isAuthenticated ? '/products' : '/'} className="navbar-brand">
          🎓 EduCycle
          <span className="navbar-brand-tagline">Trao đổi tài liệu sinh viên</span>
        </Link>

        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Mở menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          {isAdmin ? (
            <NavLink to="/dashboard" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              📊 Bảng Điều Khiển
            </NavLink>
          ) : (
            <>
              {!isAuthenticated && (
                <NavLink to="/" end className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  Trang Chủ
                </NavLink>
              )}
              <NavLink to="/products" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                {isAuthenticated ? '📚 Tìm Sách & Tài Liệu' : 'Duyệt'}
              </NavLink>
              {!isAuthenticated && (
                <NavLink to="/contact" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  Liên Hệ
                </NavLink>
              )}
            </>
          )}
        </div>

        <div className="navbar-actions">
          {isAuthenticated && (
            <div className="navbar-notif-menu" ref={notifMenuRef}>
              <button
                className="navbar-icon-btn navbar-notif-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Thông báo"
              >
                🔔
                {unreadCount > 0 && <span className="navbar-notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </button>
              {notifOpen && (
                <div className="navbar-notif-dropdown">
                  <div className="navbar-notif-header">
                    <span className="navbar-notif-title">Thông báo</span>
                    {unreadCount > 0 && (
                      <button className="navbar-notif-mark-all" onClick={() => markAllAsRead()}>
                        Đánh dấu tất cả đã đọc
                      </button>
                    )}
                  </div>
                  <div className="navbar-notif-list">
                    {notifList.length === 0 ? (
                      <div className="navbar-notif-empty">Không có thông báo</div>
                    ) : (
                      notifList.slice(0, 20).map(n => (
                        <div
                          key={n.id}
                          className={`navbar-notif-item ${!n.read ? 'unread' : ''}`}
                          onClick={() => { if (!n.read) markAsRead(n.id); setNotifOpen(false); }}
                        >
                          <div className="navbar-notif-item-title">{n.title}</div>
                          <div className="navbar-notif-item-msg">{n.message}</div>
                          <div className="navbar-notif-item-time">
                            {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {!isAdmin && (
            <Link to="/wishlist" className="navbar-icon-btn" aria-label="Yêu thích">
              ❤️
            </Link>
          )}
          {isAuthenticated ? (
            <div className="navbar-user-menu" ref={userMenuRef}>
              <button
                className="navbar-user-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="navbar-user-avatar">
                  {user?.username?.charAt(0)?.toUpperCase() || '👤'}
                </span>
                <span className="navbar-user-name">{user?.username}</span>
              </button>
              {userMenuOpen && (
                <div className="navbar-dropdown">
                  {!isAdmin && (
                    <>
                      <Link to="/profile" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        👤 Hồ sơ
                      </Link>
                      <Link to="/products/new" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        📦 Đăng bán
                      </Link>
                      <Link to="/transactions" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        🔄 Giao dịch
                      </Link>
                      <Link to="/wishlist" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        ❤️ Yêu thích
                      </Link>
                      <div className="navbar-dropdown-divider" />
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <Link to="/dashboard" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        📊 Bảng Điều Khiển
                      </Link>
                      <div className="navbar-dropdown-divider" />
                    </>
                  )}
                  <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={handleLogout}>
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth">
              <button className="navbar-auth-btn">Đăng nhập</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
