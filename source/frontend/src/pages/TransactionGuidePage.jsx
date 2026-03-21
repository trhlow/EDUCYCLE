import { Link } from 'react-router-dom';
import './TransactionGuidePage.css';

const STEPS = [
  {
    number: 1,
    icon: '🔍',
    title: 'Tìm kiếm sản phẩm',
    description: 'Duyệt danh sách sản phẩm, sử dụng bộ lọc theo thể loại, giá cả để tìm tài liệu bạn cần.',
    tips: ['Xem kỹ mô tả và hình ảnh sản phẩm', 'Kiểm tra điểm đánh giá của người bán'],
  },
  {
    number: 2,
    icon: '📩',
    title: 'Gửi yêu cầu mua',
    description: 'Nhấn "Gửi yêu cầu mua" trên trang sản phẩm. Người bán sẽ nhận được thông báo và quyết định chấp nhận hoặc từ chối.',
    tips: ['Chỉ gửi yêu cầu khi bạn thực sự muốn mua', 'Mỗi sản phẩm chỉ có 1 yêu cầu hoạt động cùng lúc'],
  },
  {
    number: 3,
    icon: '💬',
    title: 'Nhắn tin thỏa thuận',
    description: 'Sau khi người bán chấp nhận, hệ thống chat nội bộ sẽ mở. Hai bên thỏa thuận thời gian và địa điểm gặp mặt.',
    tips: ['Chọn địa điểm công cộng trong khuôn viên trường', 'Hẹn giờ cụ thể và xác nhận trước khi gặp'],
  },
  {
    number: 4,
    icon: '🤝',
    title: 'Gặp mặt giao dịch',
    description: 'Gặp nhau tại địa điểm đã hẹn. Kiểm tra sản phẩm thực tế trước khi xác nhận.',
    tips: ['Kiểm tra tình trạng sách/sản phẩm kỹ lưỡng', 'Gặp mặt ở nơi có nhiều người qua lại'],
  },
  {
    number: 5,
    icon: '🔐',
    title: 'Xác nhận OTP',
    description: 'Người BÁN tạo mã OTP trên ứng dụng → Người MUA nhập mã → Cả hai xác nhận → Giao dịch hoàn tất.',
    tips: [
      'Cả hai phải bấm xác nhận TẠI CHỖ, không về nhà mới xác nhận',
      'Mã OTP có thời hạn 15 phút',
      'Nếu không xác nhận trong 24h, hệ thống tự động hoàn thành',
    ],
  },
  {
    number: 6,
    icon: '⭐',
    title: 'Đánh giá đối tác',
    description: 'Sau khi giao dịch hoàn tất, cả hai bên có thể đánh giá nhau bằng hệ thống 5 sao. Điểm đánh giá giúp xây dựng uy tín trên nền tảng.',
    tips: ['Đánh giá trung thực giúp cộng đồng phát triển', 'Đánh giá cao cho giao dịch thuận lợi'],
  },
];

const RULES = [
  {
    icon: '⚠️',
    title: 'Quy định bắt buộc',
    items: [
      'Xác nhận OTP phải thực hiện TẠI ĐỊA ĐIỂM giao dịch',
      'Không xác nhận qua tin nhắn hoặc về nhà mới xác nhận',
      'Kiểm tra sản phẩm trước khi bấm xác nhận nhận hàng',
    ],
  },
  {
    icon: '⏰',
    title: 'Quy định thời gian',
    items: [
      'Người bán có 48 giờ để phản hồi yêu cầu mua (nếu không → tự động hủy)',
      'Sau khi chấp nhận, hai bên có 7 ngày để hoàn thành giao dịch',
      'Nếu người mua không xác nhận nhận hàng trong 24h sau khi gặp → hệ thống tự động hoàn thành',
    ],
  },
  {
    icon: '🛡️',
    title: 'Bảo vệ người dùng',
    items: [
      'Thông tin cá nhân (SĐT, email riêng) được bảo mật',
      'Liên lạc chỉ qua chat nội bộ của hệ thống',
      'Tranh chấp được xử lý bởi quản trị viên',
    ],
  },
];

const FAQS = [
  {
    q: 'Nếu người mua nhận sách rồi nhưng không bấm xác nhận thì sao?',
    a: 'Hệ thống có cơ chế "Auto-Complete": Nếu sau 24h kể từ khi chuyển sang trạng thái "Gặp mặt" mà người mua không xác nhận, giao dịch sẽ tự động hoàn thành. Tuy nhiên, người mua sẽ bị trừ điểm uy tín.',
  },
  {
    q: 'Nếu sản phẩm thực tế không giống mô tả thì sao?',
    a: 'Bạn có quyền TỪ CHỐI nhận hàng tại chỗ và mở "Tranh chấp" (Dispute). Quản trị viên sẽ xem xét và xử lý.',
  },
  {
    q: 'Tại sao phải xác nhận OTP tại chỗ?',
    a: 'Để đảm bảo cả hai bên thực sự đã gặp nhau và sản phẩm đã được kiểm tra. Tránh tình trạng xác nhận ảo hoặc gian lận.',
  },
  {
    q: 'Tôi có thể hủy giao dịch không?',
    a: 'Người MUA có thể hủy khi giao dịch đang ở trạng thái "Chờ xác nhận". Sau khi người bán chấp nhận, việc hủy sẽ ảnh hưởng đến điểm uy tín.',
  },
  {
    q: 'Làm sao liên lạc với đối tác giao dịch?',
    a: 'Sử dụng hệ thống chat nội bộ có sẵn trong mỗi giao dịch. Chat chỉ mở khi người bán đã chấp nhận yêu cầu mua.',
  },
];

export default function TransactionGuidePage() {
  return (
    <div className="guide-page">
      <div className="guide-container">
        {/* Hero */}
        <section className="guide-hero">
          <h1 className="guide-hero-title">📖 Hướng dẫn Giao dịch</h1>
          <p className="guide-hero-subtitle">
            Tìm hiểu quy trình mua bán an toàn trên EduCycle từ A đến Z
          </p>
          <Link to="/transactions" className="guide-back-btn">
            ← Quay lại giao dịch
          </Link>
        </section>

        {/* Steps */}
        <section className="guide-steps-section">
          <h2 className="guide-section-title">Quy trình 6 bước</h2>
          <div className="guide-steps">
            {STEPS.map((step) => (
              <div key={step.number} className="guide-step-card">
                <div className="guide-step-number">{step.number}</div>
                <div className="guide-step-icon">{step.icon}</div>
                <h3 className="guide-step-title">{step.title}</h3>
                <p className="guide-step-desc">{step.description}</p>
                {step.tips && (
                  <ul className="guide-step-tips">
                    {step.tips.map((tip, i) => (
                      <li key={i}>💡 {tip}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Flow Diagram */}
        <section className="guide-flow-section">
          <h2 className="guide-section-title">Sơ đồ trạng thái giao dịch</h2>
          <div className="guide-flow">
            <div className="guide-flow-item guide-flow-pending">
              <span className="guide-flow-label">⏳ Chờ xác nhận</span>
            </div>
            <div className="guide-flow-arrow">↓</div>
            <div className="guide-flow-branch">
              <div className="guide-flow-path">
                <div className="guide-flow-item guide-flow-accepted">
                  <span className="guide-flow-label">✅ Chấp nhận</span>
                </div>
                <div className="guide-flow-arrow">↓</div>
                <div className="guide-flow-item guide-flow-meeting">
                  <span className="guide-flow-label">🤝 Gặp mặt</span>
                </div>
                <div className="guide-flow-arrow">↓</div>
                <div className="guide-flow-item guide-flow-completed">
                  <span className="guide-flow-label">🎉 Hoàn thành</span>
                </div>
              </div>
              <div className="guide-flow-path guide-flow-alt">
                <div className="guide-flow-item guide-flow-rejected">
                  <span className="guide-flow-label">❌ Từ chối</span>
                </div>
                <div className="guide-flow-item guide-flow-cancelled">
                  <span className="guide-flow-label">🚫 Hủy</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rules */}
        <section className="guide-rules-section">
          <h2 className="guide-section-title">Quy định giao dịch</h2>
          <div className="guide-rules-grid">
            {RULES.map((rule, i) => (
              <div key={i} className="guide-rule-card">
                <div className="guide-rule-icon">{rule.icon}</div>
                <h3 className="guide-rule-title">{rule.title}</h3>
                <ul className="guide-rule-items">
                  {rule.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="guide-faq-section">
          <h2 className="guide-section-title">Câu hỏi thường gặp</h2>
          <div className="guide-faq-list">
            {FAQS.map((faq, i) => (
              <details key={i} className="guide-faq-item">
                <summary className="guide-faq-question">{faq.q}</summary>
                <p className="guide-faq-answer">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="guide-cta">
          <h2>Sẵn sàng giao dịch?</h2>
          <p>Bắt đầu khám phá và mua bán tài liệu ngay hôm nay!</p>
          <div className="guide-cta-btns">
            <Link to="/products" className="guide-cta-primary">🔍 Duyệt sản phẩm</Link>
            <Link to="/transactions" className="guide-cta-secondary">📋 Giao dịch của tôi</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
