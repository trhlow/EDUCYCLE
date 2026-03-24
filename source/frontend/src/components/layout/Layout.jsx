import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import ChatbotWidget from '../ChatbotWidget';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.css';

export default function Layout() {
  const { isAdmin, isAuthenticated } = useAuth();

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-section">
              <div className="footer-brand">🎓 EduCycle</div>
              <p className="footer-text">Sàn giao dịch tài liệu giáo dục chất lượng</p>
            </div>
            <div className="footer-section">
              <h4 className="footer-section-title">Khám phá</h4>
              <Link to="/products" className="footer-link">Sản phẩm</Link>
              <Link to="/about" className="footer-link">Giới thiệu</Link>
              <Link to="/contact" className="footer-link">Liên hệ</Link>
            </div>
            <div className="footer-section">
              <h4 className="footer-section-title">Tài khoản</h4>
              {isAuthenticated && (
                <>
                  {isAdmin ? (
                    <Link to="/admin" className="footer-link">Quản trị</Link>
                  ) : (
                    <>
                      <Link to="/profile" className="footer-link">Hồ sơ</Link>
                      <Link to="/wishlist" className="footer-link">Yêu thích</Link>
                      <Link to="/transactions" className="footer-link">Giao dịch</Link>
                    </>
                  )}
                </>
              )}
              {!isAuthenticated && (
                <>
                  <Link to="/auth" className="footer-link">Đăng nhập</Link>
                  <Link to="/auth" className="footer-link">Đăng ký</Link>
                </>
              )}
            </div>
            <div className="footer-section">
              <h4 className="footer-section-title">Liên hệ</h4>
              <span className="footer-link">📧 support@educycle.com</span>
              <span className="footer-link">📞 +84 (0) 342478051</span>
              <span className="footer-link">📍 Trà Vinh</span>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">&copy; 2026 EduCycle. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </footer>

      {/* AI Chatbot — fixed floating widget, available on all pages */}
      <ChatbotWidget />
    </div>
  );
}
