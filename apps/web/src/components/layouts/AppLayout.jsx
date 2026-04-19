import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import MobileQuickActions from './MobileQuickActions';
import EduCycleLogo from '../branding/EduCycleLogo';
import BackendStatusBanner from '../system/BackendStatusBanner';
import './AppLayout.css';

export default function AppLayout() {
  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-nav">
        Bỏ qua điều hướng
      </a>
      <Navbar />
      <BackendStatusBanner />
      <main id="main-content" className="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <MobileQuickActions />
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-section">
              <Link to="/" className="footer-brand" aria-label="EduCycle — về trang chủ">
                <EduCycleLogo size={36} />
                <span className="footer-brand-text">EduCycle</span>
              </Link>
              <p className="footer-text">Sàn giao dịch tài liệu giáo dục chất lượng</p>
            </div>
            <div className="footer-section">
              <h4 className="footer-section-title">Khám phá</h4>
              <Link to="/products" className="footer-link">Sản phẩm</Link>
              <Link to="/transactions/guide" className="footer-link">Hướng dẫn giao dịch</Link>
            </div>
            <div className="footer-section">
              <h4 className="footer-section-title">Tài khoản</h4>
              <Link to="/auth" className="footer-link">Đăng nhập</Link>
              <Link to="/profile" className="footer-link">Hồ sơ</Link>
              <Link to="/transactions" className="footer-link">Giao dịch</Link>
            </div>
            <div className="footer-section">
              <h4 className="footer-section-title">Liên hệ</h4>
              <span className="footer-link">support@educycle.com</span>
              <span className="footer-link">+84 (0) 342478051</span>
              <span className="footer-link">Trà Vinh</span>
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

