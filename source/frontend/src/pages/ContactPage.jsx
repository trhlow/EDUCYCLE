import { useState } from 'react';
import { useToast } from '../components/Toast';
import './ContactPage.css';

export default function ContactPage() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success('Tin nhắn đã được gửi! Chúng tôi sẽ phản hồi sớm.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 1000);
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <h1>Liên Hệ Với Chúng Tôi</h1>
        <p>Chúng tôi luôn sẵn lòng hỗ trợ bạn. Hãy gửi tin nhắn cho chúng tôi!</p>
      </section>

      <div className="contact-container">
        <div className="contact-info">
          <div className="contact-info-card">
            <span className="contact-info-icon">📧</span>
            <h3>Email</h3>
            <p>support@educycle.com</p>
          </div>
          <div className="contact-info-card">
            <span className="contact-info-icon">📞</span>
            <h3>Điện thoại</h3>
            <p>+84 (0) 123 456 789</p>
          </div>
          <div className="contact-info-card">
            <span className="contact-info-icon">📍</span>
            <h3>Địa chỉ</h3>
            <p>123 Nguyễn Huệ, Quận 1, TP.HCM</p>
          </div>
          <div className="contact-info-card">
            <span className="contact-info-icon">🕐</span>
            <h3>Giờ làm việc</h3>
            <p>T2 - T6: 8:00 - 17:00</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Gửi Tin Nhắn</h2>
          <div className="contact-form-row">
            <div className="contact-form-group">
              <label>Họ và tên *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="contact-form-group">
              <label>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div className="contact-form-group">
            <label>Chủ đề</label>
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            >
              <option value="">Chọn chủ đề</option>
              <option value="general">Câu hỏi chung</option>
              <option value="support">Hỗ trợ kỹ thuật</option>
              <option value="billing">Thanh toán & Hoàn tiền</option>
              <option value="partnership">Hợp tác</option>
              <option value="feedback">Góp ý</option>
            </select>
          </div>
          <div className="contact-form-group">
            <label>Tin nhắn *</label>
            <textarea
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Nhập nội dung tin nhắn..."
            />
          </div>
          <button type="submit" className="contact-submit-btn" disabled={sending}>
            {sending ? 'Đang gửi...' : 'Gửi Tin Nhắn'}
          </button>
        </form>
      </div>

      <section className="contact-faq">
        <h2>Câu Hỏi Thường Gặp</h2>
        <div className="contact-faq-list">
          {[
            { q: 'Làm thế nào để mua khóa học?', a: 'Duyệt khóa học, thêm vào giỏ hàng và tiến hành thanh toán. Khóa học sẽ có trong bảng điều khiển ngay lập tức.' },
            { q: 'Tôi có thể hoàn tiền không?', a: 'Có, chúng tôi có chính sách hoàn tiền 30 ngày cho tất cả các khóa học nếu bạn không hài lòng.' },
            { q: 'Làm sao để bán khóa học?', a: 'Đăng ký tài khoản, vào bảng điều khiển và tạo khóa học mới. Sau khi được duyệt, khóa học sẽ xuất hiện trên sàn.' },
            { q: 'Hỗ trợ khách hàng hoạt động khi nào?', a: 'Đội ngũ hỗ trợ làm việc từ T2-T6, 8:00-17:00. Email được phản hồi trong 24 giờ.' },
          ].map((item, i) => (
            <details key={i} className="contact-faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
