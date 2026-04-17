import { useState } from 'react';
import { useToast } from '../components/Toast';
import './ContactPage.css';

const IconMail = () => (
  <svg className="contact-info-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m22 6-10 7L2 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconPhone = () => (
  <svg className="contact-info-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.71.54 2.54a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.83.24 1.68.42 2.54.54A2 2 0 0 1 22 16.92z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconMapPin = () => (
  <svg className="contact-info-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const IconClock = () => (
  <svg className="contact-info-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const toast = useToast();

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
            <span className="contact-info-icon">
              <IconMail />
            </span>
            <h3>Email</h3>
            <p>
              <a href="mailto:support@educycle.com">support@educycle.com</a>
            </p>
          </div>
          <div className="contact-info-card">
            <span className="contact-info-icon">
              <IconPhone />
            </span>
            <h3>Điện thoại</h3>
            <p>
              <a href="tel:+84342478051">+84 (0) 342478051</a>
            </p>
          </div>
          <div className="contact-info-card">
            <span className="contact-info-icon">
              <IconMapPin />
            </span>
            <h3>Địa chỉ</h3>
            <p>Trà Vinh, Việt Nam</p>
          </div>
          <div className="contact-info-card">
            <span className="contact-info-icon">
              <IconClock />
            </span>
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
            {
              q: 'Làm thế nào để mua sách hoặc tài liệu?',
              a: 'EduCycle là sàn giao dịch trực tiếp giữa sinh viên: bạn duyệt sản phẩm trên trang chủ, đăng nhập rồi nhấn "Gửi yêu cầu mua". Khi người bán chấp nhận, hai bên chat để hẹn gặp; tại điểm gặp, người mua tạo mã OTP và người bán nhập OTP trên app để xác nhận giao dịch. Tiền và giao nhận thực tế do hai bên thỏa thuận — EduCycle không xử lý thanh toán online hay giỏ hàng kiểu thương mại điện tử.',
            },
            {
              q: 'Tôi có hoàn tiền qua EduCycle không?',
              a: 'Không. EduCycle không thu phí và không giữ tiền thay bạn; thanh toán là thỏa thuận ngoài nền tảng. Nếu có vấn đề, bạn có thể báo tranh chấp (khi giao dịch đang ở bước gặp mặt) để admin xem xét, hoặc gửi email hỗ trợ kèm mã giao dịch.',
            },
            {
              q: 'Làm sao để đăng bán sản phẩm?',
              a: 'Đăng ký bằng email .edu.vn và xác thực OTP. Sau đó vào mục Đăng bán, điền thông tin sản phẩm (mô tả, giá cố định hoặc giá liên hệ, ảnh nếu có). Tin đăng được admin kiểm duyệt; khi được duyệt, sản phẩm hiển thị trên sàn cho người khác xem.',
            },
            {
              q: 'Hỗ trợ hoạt động khi nào?',
              a: 'Chúng tôi tiếp nhận yêu cầu qua email và form liên hệ trong giờ hành chính: thứ Hai–thứ Sáu, 8:00–17:00 (giờ Việt Nam). Thường phản hồi email trong vòng 24 giờ làm việc. Đối với đồ án/demo, quy mô hỗ trợ có thể hạn chế — cảm ơn bạn đã thông cảm.',
            },
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
