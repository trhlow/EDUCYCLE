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
    description: 'Gặp nhau tại địa điểm đã hẹn. Kiểm tra sản phẩm thực tế KỸ LƯỠNG trước khi xác nhận.',
    tips: [
      'Kiểm tra tình trạng sách/sản phẩm so với mô tả và hình ảnh đã đăng',
      'Gặp mặt ở nơi có nhiều người qua lại để đảm bảo an toàn',
      'Không đưa OTP nếu chưa hài lòng với sản phẩm',
    ],
  },
  {
    number: 5,
    icon: '🔐',
    title: 'Xác nhận bằng OTP',
    description:
      'Người MUA bấm "Tạo mã OTP" trên app → Đọc mã 6 số cho người BÁN → Người BÁN nhập mã vào app → Giao dịch hoàn tất. ' +
      'Nếu sản phẩm không đúng mô tả, người MUA bấm "Báo tranh chấp" thay vì đưa mã.',
    tips: [
      'Người MUA tạo mã — người BÁN nhập mã (không làm ngược lại)',
      'Mã OTP có hiệu lực 10 phút, chỉ dùng được 1 lần',
      'Chưa đưa mã OTP = giao dịch chưa hoàn tất — người mua được bảo vệ',
      'Tuyệt đối không nhập OTP nếu chưa kiểm tra sản phẩm kỹ',
    ],
  },
  {
    number: 6,
    icon: '⚠️',
    title: 'Báo tranh chấp (nếu có)',
    description:
      'Nếu sản phẩm thực tế không đúng mô tả: người MUA bấm "Báo tranh chấp" ' +
      'TRƯỚC KHI đưa mã OTP. Giao dịch chuyển sang trạng thái Tranh chấp — ' +
      'Admin sẽ xem xét chat, ảnh sản phẩm và lịch sử giao dịch để phán quyết.',
    tips: [
      'Chỉ báo tranh chấp khi có lý do chính đáng (ảnh/mô tả sai sự thật)',
      'Admin xem xét toàn bộ lịch sử chat — hãy trao đổi rõ ràng trong chat',
      'Báo tranh chấp ác ý nhiều lần sẽ bị khóa tài khoản',
    ],
  },
  {
    number: 7,
    icon: '⭐',
    title: 'Đánh giá đối tác',
    description: 'Sau khi giao dịch hoàn tất, cả hai bên có thể đánh giá nhau bằng hệ thống 5 sao. Điểm đánh giá giúp xây dựng uy tín trên nền tảng.',
    tips: ['Đánh giá trung thực giúp cộng đồng phát triển', 'Điểm sao chỉ xuất hiện sau giao dịch đầu tiên hoàn thành'],
  },
];

const RULES = [
  {
    icon: '⚠️',
    title: 'Quy định bắt buộc',
    items: [
      'Người MUA tạo OTP — người BÁN nhập OTP (không làm ngược)',
      'Xác nhận OTP phải thực hiện TẠI ĐỊA ĐIỂM gặp mặt',
      'Kiểm tra sản phẩm KỸ LƯỠNG trước khi đưa mã OTP cho người bán',
      'Không chia sẻ mã OTP qua chat hoặc trước khi kiểm tra hàng',
    ],
  },
  {
    icon: '⏰',
    title: 'Quy định thời gian',
    items: [
      'Người bán có 48 giờ để phản hồi yêu cầu (quá hạn → tự động hủy)',
      'Sau khi chấp nhận, hai bên có 7 ngày để hoàn thành giao dịch',
      'Mã OTP có hiệu lực 10 phút kể từ lúc tạo',
      'Người mua không xác nhận trong 24h sau trạng thái MEETING → tự động hoàn thành',
    ],
  },
  {
    icon: '🛡️',
    title: 'Bảo vệ người dùng',
    items: [
      'Mọi trao đổi qua chat nội bộ — không cần chia sẻ SĐT hay email cá nhân',
      'Tranh chấp được xử lý bởi Admin dựa trên bằng chứng chat',
      'Người mua được bảo vệ: OTP chưa nhập = giao dịch chưa chốt',
    ],
  },
  {
    icon: '🚫',
    title: 'Vi phạm & Xử lý',
    items: [
      'Hủy giao dịch liên tục không lý do: cảnh cáo → khóa tạm → khóa vĩnh viễn',
      'Đăng sản phẩm giả / sai mô tả cố ý: khóa tài khoản vĩnh viễn',
      'Báo tranh chấp ác ý nhiều lần: khóa tài khoản',
      'Điểm uy tín chỉ hiển thị sau giao dịch đầu tiên hoàn thành — người mới là "Chưa có đánh giá"',
    ],
  },
];

const FAQS = [
  {
    q: 'Ai tạo mã OTP — người mua hay người bán?',
    a: 'Người MUA tạo mã OTP trên app. Sau đó đọc mã cho người BÁN nhập. Logic này đảm bảo người mua kiểm soát thời điểm xác nhận — chưa hài lòng với sản phẩm thì không đưa mã.',
  },
  {
    q: 'Sản phẩm thực tế không đúng mô tả thì làm gì?',
    a: 'Bấm "Báo tranh chấp" TRƯỚC KHI đưa mã OTP cho người bán. Giao dịch sẽ chuyển sang trạng thái Tranh chấp và Admin sẽ xem xét dựa trên ảnh sản phẩm đã đăng và lịch sử chat.',
  },
  {
    q: 'Tôi có thể hủy giao dịch không?',
    a: 'Người MUA có thể hủy khi giao dịch đang ở trạng thái PENDING (chờ xác nhận). Sau khi người bán chấp nhận (ACCEPTED), việc hủy sẽ ảnh hưởng đến điểm uy tín.',
  },
  {
    q: 'Nếu người mua nhận hàng rồi nhưng không bấm xác nhận?',
    a: 'Sau 24 giờ kể từ trạng thái MEETING, hệ thống sẽ tự động hoàn thành giao dịch. Người mua không xác nhận đúng hạn sẽ bị trừ điểm uy tín.',
  },
  {
    q: 'Điểm uy tín mặc định của người mới là bao nhiêu?',
    a: 'Người dùng mới chưa có điểm — hiển thị là "Chưa có đánh giá". Điểm sao chỉ xuất hiện sau khi hoàn thành ít nhất 1 giao dịch.',
  },
  {
    q: 'Chat có bảo mật không? Admin có đọc được không?',
    a: 'Admin chỉ xem nội dung chat khi có tranh chấp hoặc báo cáo vi phạm. Dữ liệu chat được lưu và dùng làm bằng chứng xử lý khiếu nại.',
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
          <h2 className="guide-section-title">Quy trình 7 bước</h2>
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
              {/* Nhánh chính: thành công */}
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

              {/* Nhánh phụ: từ chối / hủy / tranh chấp */}
              <div className="guide-flow-path guide-flow-alt">
                <div className="guide-flow-item guide-flow-rejected">
                  <span className="guide-flow-label">❌ Từ chối</span>
                </div>
                <div className="guide-flow-item guide-flow-cancelled">
                  <span className="guide-flow-label">🚫 Hủy</span>
                </div>
                <div className="guide-flow-item guide-flow-disputed">
                  <span className="guide-flow-label">🔍 Tranh chấp</span>
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
