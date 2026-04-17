import { Link } from 'react-router-dom';
import './TransactionGuidePage.css';

/* ─── Quy trình 7 bước ─────────────────────────── */
const STEPS = [
  {
    number: 1, title: 'Tìm sản phẩm',
    desc: 'Duyệt danh sách, lọc theo danh mục và giá để tìm tài liệu cần.',
  },
  {
    number: 2, title: 'Gửi yêu cầu mua',
    desc: 'Nhấn "Gửi yêu cầu mua". Người bán sẽ chấp nhận hoặc từ chối.',
  },
  {
    number: 3, title: 'Nhắn tin thỏa thuận',
    desc: 'Chat nội bộ mở sau khi người bán chấp nhận. Thống nhất địa điểm & giờ gặp.',
  },
  {
    number: 4, title: 'Gặp mặt & kiểm tra',
    desc: 'Gặp ở nơi đông người. Kiểm tra kỹ sản phẩm trước khi xác nhận.',
  },
  {
    number: 5, title: 'Xác nhận OTP',
    desc: 'Người MUA tạo mã và đọc cho người BÁN nhập. Chưa đưa mã = chưa chốt.',
    highlight: true,
  },
  {
    number: 6, title: 'Báo tranh chấp (nếu có)',
    desc: 'Sản phẩm không đúng mô tả? Bấm "Báo tranh chấp" TRƯỚC khi đưa mã OTP.',
  },
  {
    number: 7, title: 'Đánh giá',
    desc: 'Đánh giá 1–5 sao sau khi hoàn tất. Điểm uy tín hiển thị từ giao dịch đầu tiên.',
  },
];

/* ─── Quy định ngắn gọn ────────────────────────── */
const RULES = [
  {
    color: 'var(--primary-50)', border: 'var(--primary-200)',
    title: 'OTP',
    items: ['Người MUA tạo mã, người BÁN nhập', 'Mã có hiệu lực 30 phút', 'Xác nhận tại chỗ — không về nhà mới nhập'],
  },
  {
    color: '#e8eaf6', border: '#c5cae9',
    title: 'Thời gian',
    items: ['Người bán phản hồi trong 48 giờ', 'Hoàn thành trong 7 ngày sau khi chấp nhận', 'Không xác nhận trong 24 giờ thì tự hoàn thành'],
  },
  {
    color: 'var(--secondary-50)', border: '#c8e6c9',
    title: 'Bảo vệ',
    items: ['Chưa nhập OTP = giao dịch chưa chốt', 'Tranh chấp được Admin xử lý', 'Chat nội bộ được lưu làm bằng chứng'],
  },
  {
    color: 'var(--error-light)', border: '#ffcdd2',
    title: 'Vi phạm',
    items: ['Hủy liên tục: cảnh cáo rồi khóa tài khoản', 'Đăng sản phẩm giả: khóa vĩnh viễn', 'Báo tranh chấp ác ý: khóa tài khoản'],
  },
];

/* ─── FAQ ──────────────────────────────────────── */
const FAQS = [
  {
    q: 'Ai tạo mã OTP?',
    a: 'Người MUA tạo mã OTP trên app, đọc cho người BÁN nhập. Người mua kiểm soát thời điểm xác nhận — chưa hài lòng thì không đưa mã.',
  },
  {
    q: 'Sản phẩm không đúng mô tả phải làm gì?',
    a: 'Bấm "Báo tranh chấp" TRƯỚC khi đưa mã OTP. Admin sẽ xem xét ảnh sản phẩm và lịch sử chat để phán quyết.',
  },
  {
    q: 'Có thể hủy giao dịch không?',
    a: 'Người mua có thể hủy yêu cầu khi còn PENDING. Sau khi chấp nhận (ACCEPTED), cả hai bên đều có thể hủy có kèm lý do (tuỳ chọn) trước khi hoàn tất.',
  },
  {
    q: 'Giao dịch có tự hết hạn không?',
    a: 'Hệ thống có job định kỳ: yêu cầu PENDING quá lâu không được phản hồi, hoặc giao dịch đã chấp nhận nhưng chưa hoàn tất OTP trong thời hạn cấu hình, có thể bị hủy tự động với lý do hệ thống. Thời hạn cụ thể do máy chủ cấu hình.',
  },
  {
    q: 'Không bấm xác nhận nhận hàng thì sao?',
    a: 'Hoàn tất chính thức khi người bán nhập đúng mã OTP. Tự động hết hạn giao dịch (nếu có) sẽ được nền tảng thông báo riêng.',
  },
  {
    q: 'Điểm uy tín người mới là bao nhiêu?',
    a: 'Người mới hiển thị "Chưa có đánh giá". Điểm sao chỉ xuất hiện sau giao dịch đầu tiên hoàn thành.',
  },
];

export default function TransactionGuidePage() {
  return (
    <div className="guide-page">
      <div className="guide-container">

        {/* Hero — gọn hơn */}
        <section className="guide-hero">
          <h1 className="guide-hero-title">Hướng dẫn giao dịch</h1>
          <p className="guide-hero-subtitle">Mua bán an toàn trên EduCycle trong 7 bước đơn giản</p>
          <Link to="/transactions" className="guide-back-btn">Quay lại giao dịch</Link>
        </section>

        {/* Issue #8: Steps — timeline dọc, gọn, dễ đọc */}
        <section style={{ marginBottom: 'var(--space-12)' }}>
          <h2 className="guide-section-title">Quy trình giao dịch</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: 680, margin: '0 auto' }}>
            {STEPS.map((step, idx) => (
              <div key={step.number} style={{
                display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start',
                padding: 'var(--space-4)',
                background: step.highlight ? 'var(--primary-50)' : 'var(--bg-primary)',
                border: `1px solid ${step.highlight ? 'var(--primary-200)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-lg)',
              }}>
                {/* số bước */}
                <div style={{
                  minWidth: 36, height: 36,
                  background: step.highlight ? 'var(--primary-500)' : 'var(--bg-tertiary)',
                  color: step.highlight ? '#fff' : 'var(--text-secondary)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-sm)',
                  flexShrink: 0,
                }}>{step.number}</div>

                {/* nội dung */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                    <span style={{
                      fontWeight: 600, fontSize: 'var(--text-base)',
                      color: step.highlight ? 'var(--primary-800)' : 'var(--text-primary)',
                    }}>{step.title}</span>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                </div>

                {/* connector line giữa các bước — không hiển thị ở bước cuối */}
                {idx < STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', left: 'calc(var(--space-4) + 18px)', height: 'var(--space-3)',
                    width: 2, background: 'var(--border-light)', display: 'none',
                  }} />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Sơ đồ trạng thái — rút gọn */}
        <section className="guide-flow-section">
          <h2 className="guide-section-title">Sơ đồ trạng thái</h2>
          <div className="guide-flow">
            <div className="guide-flow-item guide-flow-pending">Chờ xác nhận</div>
            <div className="guide-flow-arrow">↓</div>
            <div className="guide-flow-branch">
              <div className="guide-flow-path">
                <div className="guide-flow-item guide-flow-accepted">Chấp nhận</div>
                <div className="guide-flow-arrow">↓</div>
                <div className="guide-flow-item guide-flow-meeting">OTP tại điểm giao</div>
                <div className="guide-flow-arrow">↓</div>
                <div className="guide-flow-item guide-flow-completed">Hoàn thành</div>
              </div>
              <div className="guide-flow-path guide-flow-alt">
                <div className="guide-flow-item guide-flow-disputed">Tranh chấp</div>
                <div className="guide-flow-item guide-flow-rejected">Từ chối</div>
                <div className="guide-flow-item guide-flow-cancelled">Hủy</div>
              </div>
            </div>
          </div>
        </section>

        {/* Quy định — 4 card nhỏ gọn */}
        <section style={{ marginBottom: 'var(--space-12)' }}>
          <h2 className="guide-section-title">Quy định</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            {RULES.map((rule, i) => (
              <div key={i} style={{
                background: rule.color, border: `1px solid ${rule.border}`,
                borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
              }}>
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{rule.title}</span>
                </div>
                <ul style={{ paddingLeft: 'var(--space-4)', margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  {rule.items.map((item, j) => (
                    <li key={j} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ — accordion gọn */}
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
          <p>Bắt đầu mua bán tài liệu ngay hôm nay!</p>
          <div className="guide-cta-btns">
            <Link to="/products" className="guide-cta-primary">Duyệt sản phẩm</Link>
            <Link to="/transactions" className="guide-cta-secondary">Giao dịch của tôi</Link>
          </div>
        </section>

      </div>
    </div>
  );
}
