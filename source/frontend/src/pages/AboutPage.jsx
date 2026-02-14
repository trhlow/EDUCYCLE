import { Link } from 'react-router-dom';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <h1 className="about-hero-title">Về EduCycle</h1>
        <p className="about-hero-subtitle">
          Sứ mệnh của chúng tôi là kết nối người học với giáo dục chất lượng, giá cả phải chăng
        </p>
      </section>

      <section className="about-section">
        <div className="about-grid">
          <div className="about-text">
            <h2>Câu Chuyện Của Chúng Tôi</h2>
            <p>
              EduCycle được thành lập vào năm 2024 với mục tiêu đơn giản: tạo ra một nền tảng nơi mọi người
              có thể mua và bán tài liệu giáo dục một cách dễ dàng. Chúng tôi tin rằng giáo dục chất lượng
              nên được tiếp cận bởi tất cả mọi người, bất kể vị trí địa lý hay khả năng tài chính.
            </p>
            <p>
              Với hơn 2,000 người dùng và hàng trăm khóa học chất lượng, EduCycle đang trở thành
              điểm đến tin cậy cho những ai muốn nâng cao kiến thức và kỹ năng.
            </p>
          </div>
          <div className="about-image">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop" alt="Đội ngũ" />
          </div>
        </div>
      </section>

      <section className="about-stats-section">
        <div className="about-stats">
          {[
            { value: '2,000+', label: 'Người dùng' },
            { value: '500+', label: 'Khóa học' },
            { value: '50+', label: 'Giảng viên' },
            { value: '4.8', label: 'Đánh giá TB' },
          ].map((stat, i) => (
            <div key={i} className="about-stat">
              <div className="about-stat-value">{stat.value}</div>
              <div className="about-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2 className="about-section-title">Giá Trị Cốt Lõi</h2>
        <div className="about-values">
          {[
            { icon: '🎯', title: 'Chất Lượng', desc: 'Mỗi khóa học đều được kiểm duyệt kỹ lưỡng để đảm bảo chất lượng nội dung' },
            { icon: '🤝', title: 'Cộng Đồng', desc: 'Xây dựng cộng đồng học tập hỗ trợ lẫn nhau' },
            { icon: '💡', title: 'Đổi Mới', desc: 'Liên tục cải tiến trải nghiệm học tập với công nghệ mới nhất' },
            { icon: '🌍', title: 'Tiếp Cận', desc: 'Giáo dục chất lượng cho tất cả mọi người, mọi lúc, mọi nơi' },
          ].map((value, i) => (
            <div key={i} className="about-value-card">
              <div className="about-value-icon">{value.icon}</div>
              <h3>{value.title}</h3>
              <p>{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2 className="about-section-title">Đội Ngũ Của Chúng Tôi</h2>
        <div className="about-team">
          {[
            { name: 'Nguyễn Văn A', role: 'CEO & Nhà sáng lập', avatar: '👨‍💼' },
            { name: 'Trần Thị B', role: 'CTO', avatar: '👩‍💻' },
            { name: 'Lê Văn C', role: 'Giám đốc sản phẩm', avatar: '👨‍🎨' },
            { name: 'Phạm Thị D', role: 'Quản lý cộng đồng', avatar: '👩‍🏫' },
          ].map((member, i) => (
            <div key={i} className="about-team-card">
              <div className="about-team-avatar">{member.avatar}</div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="about-cta">
        <h2>Sẵn sàng bắt đầu hành trình học tập?</h2>
        <p>Tham gia cùng hàng nghìn học viên trên EduCycle ngay hôm nay</p>
        <div className="about-cta-actions">
          <Link to="/products" className="about-cta-primary">Duyệt Khóa Học</Link>
          <Link to="/auth" className="about-cta-secondary">Đăng Ký Miễn Phí</Link>
        </div>
      </section>
    </div>
  );
}
