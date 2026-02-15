import { Link } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  return (
    <div>
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-hero-title">
            Trao Đổi Sách &amp; Tài Liệu Học Tập Giữa Sinh Viên
          </h1>
          <p className="home-hero-subtitle">
            EduCycle – Nền tảng P2P giúp sinh viên mua bán, trao đổi sách giáo trình
            và dụng cụ học tập. Tiết kiệm chi phí, tái sử dụng tài nguyên, kết nối cộng đồng.
          </p>
          <div className="home-hero-actions">
            <Link to="/products" className="home-btn-primary">
              Tìm Sách Ngay
            </Link>
            <Link to="/auth" className="home-btn-secondary">
              Đăng Ký Bán Sách
            </Link>
          </div>
        </div>
      </section>

      <section className="home-features">
        <h2 className="home-features-title">Tại Sao Chọn EduCycle?</h2>
        <div className="home-features-grid">
          <div className="home-feature-card">
            <div className="home-feature-icon">📚</div>
            <h3 className="home-feature-title">Trao Đổi Trực Tiếp</h3>
            <p className="home-feature-text">
              Giao dịch P2P giữa sinh viên với nhau – không qua trung gian, không phí ẩn.
              Gặp mặt, trao sách, xác nhận ngay trên ứng dụng.
            </p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">🔒</div>
            <h3 className="home-feature-title">Xác Nhận Bằng OTP</h3>
            <p className="home-feature-text">
              Mỗi giao dịch được xác nhận bằng mã OTP tại điểm giao nhận,
              đảm bảo minh bạch và chống gian lận.
            </p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">⭐</div>
            <h3 className="home-feature-title">Đánh Giá Uy Tín</h3>
            <p className="home-feature-text">
              Hệ thống đánh giá sao (1–5) sau mỗi giao dịch hoàn tất giúp bạn chọn đúng
              người bán đáng tin cậy.
            </p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">💬</div>
            <h3 className="home-feature-title">Chat Nội Bộ An Toàn</h3>
            <p className="home-feature-text">
              Trao đổi thời gian, địa điểm giao nhận qua chat trong ứng dụng –
              không cần chia sẻ SĐT hay thông tin cá nhân.
            </p>
          </div>
        </div>
      </section>

      <section className="home-features" style={{ paddingTop: 0 }}>
        <h2 className="home-features-title">Cách Thức Hoạt Động</h2>
        <div className="home-features-grid">
          <div className="home-feature-card">
            <div className="home-feature-icon">1️⃣</div>
            <h3 className="home-feature-title">Tìm &amp; Gửi Yêu Cầu</h3>
            <p className="home-feature-text">
              Duyệt sách trên sàn, tìm cuốn bạn cần và gửi yêu cầu mua cho người bán.
            </p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">2️⃣</div>
            <h3 className="home-feature-title">Chat &amp; Hẹn Gặp</h3>
            <p className="home-feature-text">
              Sau khi người bán chấp nhận, hai bên chat để thống nhất thời gian và địa điểm gặp mặt.
            </p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">3️⃣</div>
            <h3 className="home-feature-title">Gặp Mặt &amp; Xác Nhận OTP</h3>
            <p className="home-feature-text">
              Giao sách trực tiếp, xác nhận bằng mã OTP ngay tại chỗ, rồi đánh giá lẫn nhau.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
