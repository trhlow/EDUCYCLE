import { Outlet } from 'react-router-dom';
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
          <div className="footer-brand">🎓 EduCycle</div>
          <p className="footer-text">Sàn giao dịch tài liệu giáo dục chất lượng</p>
          <p className="footer-copyright">&copy; 2026 EduCycle. Bảo lưu mọi quyền.</p>
        </div>
      </footer>
    </div>
  );
}
