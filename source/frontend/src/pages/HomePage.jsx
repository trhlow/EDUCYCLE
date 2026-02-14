import { Link } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  return (
    <div>
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-hero-title">
            Khám Phá Hành Trình Học Tập Tiếp Theo
          </h1>
          <p className="home-hero-subtitle">
            Truy cập hàng nghìn khóa học từ các giảng viên chuyên gia trên toàn thế giới.
            Mua, bán và chia sẻ tài liệu giáo dục tại một sàn giao dịch đáng tin cậy.
          </p>
          <div className="home-hero-actions">
            <Link to="/products" className="home-btn-primary">
              Duyệt Khóa Học
            </Link>
            <Link to="/auth" className="home-btn-secondary">
              Bắt Đầu Bán
            </Link>
          </div>
        </div>
      </section>

      <section className="home-features">
        <h2 className="home-features-title">Tại Sao Chọn EduCycle?</h2>
        <div className="home-features-grid">
          <div className="home-feature-card">
            <div className="home-feature-icon">📚</div>
            <h3 className="home-feature-title">Khóa Học Chất Lượng</h3>
            <p className="home-feature-text">
              Tài liệu giáo dục được chọn lọc, đánh giá bởi chuyên gia để đảm bảo nội dung chất lượng cao.
            </p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">💰</div>
            <h3 className="home-feature-title">Giá Cả Hợp Lý</h3>
            <p className="home-feature-text">
              Giá cạnh tranh với phí minh bạch. Người bán kiếm nhiều hơn, người mua trả ít hơn.
            </p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">🔒</div>
            <h3 className="home-feature-title">Giao Dịch An Toàn</h3>
            <p className="home-feature-text">
              Thanh toán được bảo vệ và tài khoản được xác minh cho sự an tâm trong mọi giao dịch.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
