import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import './Layout.css';

export default function Layout() {
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
              <Link to="/products" className="footer-link">Khóa học</Link>
              <Link to="/about" className="footer-link">Giới thiệu</Link>
              <Link to="/contact" className="footer-link">Liên hệ</Link>
            </div>
            <div className="footer-section">
              <h4 className="footer-section-title">Tài khoản</h4>
              <Link to="/dashboard" className="footer-link">Bảng điều khiển</Link>
              <Link to="/profile" className="footer-link">Hồ sơ</Link>
              <Link to="/wishlist" className="footer-link">Yêu thích</Link>
            </div>
            <div className="footer-section">
              <h4 className="footer-section-title">Liên hệ</h4>
              <span className="footer-link">📧 support@educycle.com</span>
              <span className="footer-link">📞 +84 (0) 123 456 789</span>
              <span className="footer-link">📍 TP. Hồ Chí Minh</span>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">&copy; 2026 EduCycle. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
