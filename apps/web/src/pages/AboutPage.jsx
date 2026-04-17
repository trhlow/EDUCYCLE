import { Link } from 'react-router-dom';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="abt">
      <section className="abt-hero">
        <div className="abt-hero-inner">
          <span className="abt-pill">Dự án cá nhân</span>
          <h1>
            Trao đổi tài liệu,<br />
            <span className="abt-gradient-text">không lãng phí.</span>
          </h1>
          <p>
            EduCycle giúp sinh viên tìm, đăng và trao đổi sách &amp; tài liệu học tập một cách nhanh gọn và minh bạch.
          </p>
          <div className="abt-hero-btns">
            <Link to="/products" className="abt-btn abt-btn--fill">Khám phá ngay</Link>
            <Link to="/auth" className="abt-btn abt-btn--outline">Đăng nhập</Link>
          </div>
        </div>

        <div className="abt-hero-visual">
          <div className="abt-orb abt-orb--1" />
          <div className="abt-orb abt-orb--2" />
          <div className="abt-orb abt-orb--3" />
        </div>
      </section>

      <section className="abt-why">
        <h2 className="abt-heading">Tại sao chọn EduCycle?</h2>
        <div className="abt-cards">
          <article className="abt-card">
            <h3>Trao đổi tài liệu</h3>
            <p>Đăng bán hoặc tìm mua sách, giáo trình dễ dàng giữa sinh viên với nhau.</p>
          </article>
          <article className="abt-card">
            <h3>Tiết kiệm chi phí</h3>
            <p>Mua lại tài liệu cũ với giá hợp lý, bán lại những gì không còn cần.</p>
          </article>
          <article className="abt-card">
            <h3>Tái sử dụng</h3>
            <p>Kéo dài vòng đời tài liệu thay vì để chúng nằm phủ bụi.</p>
          </article>
        </div>
      </section>

      <section className="abt-dev">
        <div className="abt-dev-inner">
          <div className="abt-dev-avatar">THL</div>
          <div className="abt-dev-info">
            <span className="abt-pill abt-pill--dark">Người phát triển</span>
            <h2>Trần Hoàng Long</h2>
            <p>
              Thiết kế, lập trình và hoàn thiện toàn bộ dự án — từ giao diện đến hệ thống backend —
              với mục tiêu tạo ra sản phẩm thực sự hữu ích cho sinh viên.
            </p>
          </div>
        </div>
      </section>

      <section className="abt-bottom">
        <h2>Sẵn sàng trải nghiệm?</h2>
        <p>Tìm tài liệu phù hợp hoặc đăng bán ngay hôm nay.</p>
        <div className="abt-hero-btns">
          <Link to="/products" className="abt-btn abt-btn--fill">Xem tài liệu</Link>
          <Link to="/post-product" className="abt-btn abt-btn--outline">Đăng bán</Link>
        </div>
      </section>
    </div>
  );
}
