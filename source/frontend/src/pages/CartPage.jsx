import { Link } from 'react-router-dom';
import './CartPage.css';

/**
 * EduCycle là chợ P2P (gặp mặt + OTP) — không có giỏ hàng hay thanh toán online.
 * Route /cart giữ để bookmark cũ không gãy; nội dung hướng dẫn đúng mô hình.
 */
export default function CartPage() {
  return (
    <div className="cart-container p2p-cart-info">
      <h1 className="cart-title">Giao dịch trên EduCycle</h1>
      <p className="p2p-cart-lead">
        Bạn <strong>không thêm sách vào giỏ</strong> hay thanh toán bằng thẻ. Luồng đúng là:{' '}
        <strong>gửi yêu cầu mua</strong> → trao đổi trong chat → gặp mặt → <strong>mã OTP</strong> để hoàn tất.
      </p>
      <ul className="p2p-cart-steps">
        <li>Duyệt tài liệu / sách trên trang chủ hoặc mục Duyệt.</li>
        <li>Vào chi tiết sản phẩm và nhấn gửi yêu cầu (hoặc từ danh sách yêu thích → Xem chi tiết).</li>
        <li>Theo dõi giao dịch tại <Link to="/transactions">Giao dịch của tôi</Link>.</li>
      </ul>
      <div className="p2p-cart-actions">
        <Link to="/" className="p2p-cart-btn primary">
          Về trang chủ — duyệt tài liệu
        </Link>
        <Link to="/transactions" className="p2p-cart-btn secondary">
          Xem giao dịch
        </Link>
        <Link to="/transactions/guide" className="p2p-cart-btn secondary">
          Hướng dẫn giao dịch & OTP
        </Link>
      </div>
    </div>
  );
}
