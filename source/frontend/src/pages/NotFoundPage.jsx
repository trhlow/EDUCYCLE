import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Trang Không Tìm Thấy</h1>
        <p className="notfound-text">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="notfound-btn-primary">Về Trang Chủ</Link>
          <Link to="/products" className="notfound-btn-secondary">Duyệt Khóa Học</Link>
        </div>
      </div>
    </div>
  );
}
