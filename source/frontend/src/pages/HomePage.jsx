import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

/* ── Animated counter hook ── */
function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
}

/* ── Scroll-reveal wrapper ── */
function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal--visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ── Data ── */
const FEATURES = [
  { icon: '📚', title: 'Trao Đổi Trực Tiếp', text: 'Giao dịch P2P giữa sinh viên – không qua trung gian, không phí ẩn.' },
  { icon: '🔒', title: 'Xác Nhận OTP', text: 'Xác nhận tại điểm giao nhận bằng mã OTP, đảm bảo minh bạch.' },
  { icon: '⭐', title: 'Đánh Giá Uy Tín', text: 'Đánh giá 1–5 sao sau mỗi giao dịch – lọc người bán đáng tin.' },
  { icon: '💬', title: 'Chat An Toàn', text: 'Chat nội bộ – không cần chia sẻ SĐT hay thông tin cá nhân.' },
  { icon: '🌱', title: 'Xanh & Bền Vững', text: 'Tái sử dụng sách, giảm lãng phí tài nguyên giáo dục.' },
  { icon: '⚡', title: 'Nhanh & Tiện', text: 'Đăng sách trong 1 phút, tìm tài liệu chỉ vài giây.' },
];

const STEPS = [
  { num: '01', title: 'Đăng Ký & Đăng Bán', desc: 'Tạo tài khoản, chụp ảnh sách và đăng lên sàn trong vài phút.', icon: '📝' },
  { num: '02', title: 'Tìm & Gửi Yêu Cầu', desc: 'Duyệt sách, lọc theo danh mục, giá, đánh giá rồi gửi yêu cầu mua.', icon: '🔍' },
  { num: '03', title: 'Chat & Hẹn Gặp', desc: 'Thống nhất thời gian, địa điểm gặp mặt qua chat trong ứng dụng.', icon: '💬' },
  { num: '04', title: 'Giao Nhận & OTP', desc: 'Giao sách tận tay, xác nhận bằng OTP, đánh giá và hoàn tất.', icon: '✅' },
];

const CATEGORIES = [
  { name: 'Giáo Trình', icon: '📖', color: '#2196f3' },
  { name: 'Sách Chuyên Ngành', icon: '🔬', color: '#9c27b0' },
  { name: 'Tài Liệu Ôn Thi', icon: '📝', color: '#ff9800' },
  { name: 'Dụng Cụ Học Tập', icon: '✏️', color: '#4caf50' },
  { name: 'Ngoại Ngữ', icon: '🌍', color: '#00bcd4' },
  { name: 'Khác', icon: '📦', color: '#607d8b' },
];

const TESTIMONIALS = [
  { name: 'Minh Anh', role: 'SV Bách Khoa TP.HCM', text: 'Mua được bộ giáo trình Giải tích chỉ 40% giá gốc. Sách còn mới, giao dịch nhanh gọn!', rating: 5 },
  { name: 'Hoàng Nam', role: 'SV Kinh Tế TP.HCM', text: 'Bán lại sách cũ được tiền mua tài liệu mới. Rất tiện lợi và an toàn nhờ OTP.', rating: 5 },
  { name: 'Thùy Linh', role: 'SV KHTN TP.HCM', text: 'Chat trong app rất tiện, không cần trao đổi SĐT. Người bán thân thiện, sách đúng mô tả.', rating: 4 },
];

const BLOG_POSTS = [
  { title: 'Mẹo tiết kiệm chi phí sách mỗi kỳ học', date: '15/02/2026', tag: 'Mẹo hay', excerpt: 'Sinh viên có thể tiết kiệm đến 60% chi phí tài liệu mỗi kỳ nhờ trao đổi sách cũ...' },
  { title: 'TOP 5 giáo trình được tìm kiếm nhiều nhất', date: '10/02/2026', tag: 'Xu hướng', excerpt: 'Giải tích, Vật lý đại cương và Tiếng Anh chuyên ngành dẫn đầu danh sách...' },
  { title: 'EduCycle cập nhật hệ thống đánh giá mới', date: '05/02/2026', tag: 'Tin tức', excerpt: 'Hệ thống đánh giá được nâng cấp với chi tiết hơn, giúp chọn đúng người bán...' },
];

export default function HomePage() {
  const [statUsers, refUsers] = useCountUp(2500);
  const [statProducts, refProducts] = useCountUp(8400);
  const [statTrans, refTrans] = useCountUp(3200);

  return (
    <div className="landing">
      {/* ═══════════ HERO ═══════════ */}
      <section className="hero">
        <div className="hero__bg-shapes">
          <div className="hero__shape hero__shape--1" />
          <div className="hero__shape hero__shape--2" />
          <div className="hero__shape hero__shape--3" />
        </div>

        <div className="hero__content">
          <span className="hero__badge">🎓 Nền tảng #1 cho sinh viên</span>
          <h1 className="hero__title">
            Trao Đổi Sách & Tài Liệu
            <span className="hero__title-highlight"> Thông Minh</span>
          </h1>
          <p className="hero__subtitle">
            EduCycle kết nối sinh viên mua bán sách giáo trình, tài liệu ôn thi
            và dụng cụ học tập. Tiết kiệm chi phí – tái sử dụng tài nguyên – xây dựng cộng đồng xanh.
          </p>
          <div className="hero__actions">
            <Link to="/products" className="btn btn--primary btn--lg">
              🔍 Tìm Sách Ngay
            </Link>
            <Link to="/auth" className="btn btn--outline btn--lg">
              ✨ Bắt Đầu Bán Sách
            </Link>
          </div>
          <div className="hero__trust">
            <div className="hero__trust-avatars">
              <span className="hero__trust-avatar">👩‍🎓</span>
              <span className="hero__trust-avatar">👨‍🎓</span>
              <span className="hero__trust-avatar">👩‍💻</span>
              <span className="hero__trust-avatar">👨‍💻</span>
            </div>
            <span className="hero__trust-text">
              <strong>2.500+</strong> sinh viên đang sử dụng
            </span>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__card hero__card--1">
            <span className="hero__card-icon">📖</span>
            <span className="hero__card-label">Giáo Trình Giải Tích</span>
            <span className="hero__card-price">45.000đ</span>
          </div>
          <div className="hero__card hero__card--2">
            <span className="hero__card-icon">🔬</span>
            <span className="hero__card-label">Vật Lý Đại Cương</span>
            <span className="hero__card-price">35.000đ</span>
          </div>
          <div className="hero__card hero__card--3">
            <span className="hero__card-icon">🌍</span>
            <span className="hero__card-label">IELTS Cambridge 18</span>
            <span className="hero__card-price">60.000đ</span>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="stats">
        <div className="stats__grid">
          <div className="stats__item" ref={refUsers}>
            <span className="stats__number">{statUsers.toLocaleString('vi-VN')}+</span>
            <span className="stats__label">Sinh Viên</span>
          </div>
          <div className="stats__item" ref={refProducts}>
            <span className="stats__number">{statProducts.toLocaleString('vi-VN')}+</span>
            <span className="stats__label">Tài Liệu</span>
          </div>
          <div className="stats__item" ref={refTrans}>
            <span className="stats__number">{statTrans.toLocaleString('vi-VN')}+</span>
            <span className="stats__label">Giao Dịch</span>
          </div>
          <div className="stats__item">
            <span className="stats__number">4.8 ★</span>
            <span className="stats__label">Đánh Giá TB</span>
          </div>
        </div>
      </section>

      {/* ═══════════ ABOUT ═══════════ */}
      <section className="about">
        <div className="section-container">
          <Reveal>
            <div className="about__grid">
              <div className="about__visual">
                <div className="about__illustration">
                  <div className="about__ill-circle" />
                  <span className="about__ill-emoji about__ill-emoji--1">📚</span>
                  <span className="about__ill-emoji about__ill-emoji--2">♻️</span>
                  <span className="about__ill-emoji about__ill-emoji--3">🤝</span>
                </div>
              </div>
              <div className="about__content">
                <span className="section-badge">Về EduCycle</span>
                <h2 className="section-title">Tái Sử Dụng Tri Thức,<br />Kết Nối Sinh Viên</h2>
                <p className="about__text">
                  EduCycle ra đời từ ý tưởng đơn giản: <strong>sách giáo trình không nên bị lãng phí</strong>.
                  Mỗi kỳ học, hàng nghìn cuốn sách bị bỏ quên sau khi kết thúc môn học.
                </p>
                <p className="about__text">
                  Chúng tôi xây dựng nền tảng P2P để sinh viên dễ dàng mua bán, trao đổi tài liệu
                  với nhau – <strong>tiết kiệm chi phí, bảo vệ môi trường và tạo cộng đồng học tập bền vững</strong>.
                </p>
                <div className="about__highlights">
                  <div className="about__highlight-item">
                    <span className="about__highlight-icon">🎯</span>
                    <div>
                      <strong>Sứ mệnh</strong>
                      <p>Giảm 50% chi phí tài liệu cho sinh viên</p>
                    </div>
                  </div>
                  <div className="about__highlight-item">
                    <span className="about__highlight-icon">🌿</span>
                    <div>
                      <strong>Tầm nhìn</strong>
                      <p>Hệ sinh thái giáo dục tuần hoàn ở Việt Nam</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ CATEGORIES ═══════════ */}
      <section className="categories">
        <div className="section-container">
          <Reveal>
            <span className="section-badge section-badge--center">Danh Mục</span>
            <h2 className="section-title section-title--center">Sản Phẩm Nổi Bật</h2>
          </Reveal>
          <div className="categories__grid">
            {CATEGORIES.map((cat, i) => (
              <Reveal key={cat.name} delay={i * 80}>
                <Link to="/products" className="category-card" style={{ '--cat-color': cat.color }}>
                  <span className="category-card__icon">{cat.icon}</span>
                  <span className="category-card__name">{cat.name}</span>
                  <span className="category-card__arrow">→</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="features">
        <div className="section-container">
          <Reveal>
            <span className="section-badge section-badge--center">Tính Năng</span>
            <h2 className="section-title section-title--center">Tại Sao Chọn EduCycle?</h2>
          </Reveal>
          <div className="features__grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <div className="feature-card">
                  <div className="feature-card__icon-wrap">
                    <span className="feature-card__icon">{f.icon}</span>
                  </div>
                  <h3 className="feature-card__title">{f.title}</h3>
                  <p className="feature-card__text">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="how-it-works">
        <div className="section-container">
          <Reveal>
            <span className="section-badge section-badge--center">Quy Trình</span>
            <h2 className="section-title section-title--center">Cách Thức Hoạt Động</h2>
          </Reveal>
          <div className="steps__grid">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 120}>
                <div className="step-card">
                  <div className="step-card__num">{s.num}</div>
                  <span className="step-card__icon">{s.icon}</span>
                  <h3 className="step-card__title">{s.title}</h3>
                  <p className="step-card__desc">{s.desc}</p>
                  {i < STEPS.length - 1 && <div className="step-card__connector" />}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="testimonials">
        <div className="section-container">
          <Reveal>
            <span className="section-badge section-badge--center">Đánh Giá</span>
            <h2 className="section-title section-title--center">Sinh Viên Nói Gì?</h2>
          </Reveal>
          <div className="testimonials__grid">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="testimonial-card">
                  <div className="testimonial-card__stars">
                    {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                  </div>
                  <p className="testimonial-card__text">"{t.text}"</p>
                  <div className="testimonial-card__author">
                    <div className="testimonial-card__avatar">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <strong className="testimonial-card__name">{t.name}</strong>
                      <span className="testimonial-card__role">{t.role}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ BLOG / NEWS ═══════════ */}
      <section className="blog">
        <div className="section-container">
          <Reveal>
            <span className="section-badge section-badge--center">Tin Tức</span>
            <h2 className="section-title section-title--center">Bài Viết Mới Nhất</h2>
          </Reveal>
          <div className="blog__grid">
            {BLOG_POSTS.map((post, i) => (
              <Reveal key={post.title} delay={i * 100}>
                <article className="blog-card">
                  <div className="blog-card__header">
                    <span className="blog-card__tag">{post.tag}</span>
                    <span className="blog-card__date">{post.date}</span>
                  </div>
                  <h3 className="blog-card__title">{post.title}</h3>
                  <p className="blog-card__excerpt">{post.excerpt}</p>
                  <span className="blog-card__link">Đọc thêm →</span>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="cta">
        <Reveal>
          <div className="cta__content">
            <h2 className="cta__title">Sẵn Sàng Tiết Kiệm Chi Phí Học Tập?</h2>
            <p className="cta__subtitle">
              Tham gia cộng đồng 2.500+ sinh viên đang trao đổi sách trên EduCycle.
            </p>
            <div className="cta__actions">
              <Link to="/auth" className="btn btn--white btn--lg">
                🚀 Tạo Tài Khoản Miễn Phí
              </Link>
              <Link to="/products" className="btn btn--ghost btn--lg">
                Xem Sản Phẩm →
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
