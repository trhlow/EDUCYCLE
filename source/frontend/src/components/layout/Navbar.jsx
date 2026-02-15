import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
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
        <Link to="/" className="navbar-brand">
          🎓 EduCycle
        </Link>

        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Mở menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/products" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Duyệt
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Giới Thiệu
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            Liên Hệ
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/transactions" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              Giao dịch
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/dashboard" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              Bảng điều khiển
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              Quản trị
            </NavLink>
          )}
        </div>

        <div className="navbar-actions">
          <Link to="/wishlist" className="navbar-icon-btn" aria-label="Yêu thích">
            ❤️
          </Link>
          <Link to="/cart" className="navbar-icon-btn" aria-label="Giỏ hàng">
            🛒
            {itemCount > 0 && <span className="navbar-cart-badge">{itemCount}</span>}
          </Link>
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
                  <Link to="/profile" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    👤 Hồ sơ
                  </Link>
                  <Link to="/dashboard" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    📊 Bảng điều khiển
                  </Link>
                  <Link to="/transactions" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    🔄 Giao dịch
                  </Link>
                  <Link to="/wishlist" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    ❤️ Yêu thích
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="navbar-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      ⚙️ Quản trị
                    </Link>
                  )}
                  <div className="navbar-dropdown-divider" />
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
