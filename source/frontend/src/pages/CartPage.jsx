import { useState } from 'react';
import { Link } from 'react-router-dom';
import './CartPage.css';

const INITIAL_CART = [
  {
    id: '1',
    name: 'Khóa Học Lập Trình Python Nâng Cao',
    category: 'Lập Trình',
    seller: 'CodeMaster Pro',
    price: 49.99,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop',
  },
  {
    id: '2',
    name: 'Khóa Học Phát Triển Web Toàn Diện',
    category: 'Phát Triển Web',
    seller: 'WebDev Academy',
    price: 89.99,
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop',
  },
  {
    id: '3',
    name: 'Cơ Bản Khoa Học Dữ Liệu',
    category: 'Khoa Học Dữ Liệu',
    seller: 'DataPro Institute',
    price: 69.99,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(INITIAL_CART);
  const [step, setStep] = useState('cart');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  if (step === 'confirmation') {
    return (
      <div className="cart-container">
        <div className="checkout-success">
          <div className="checkout-success-icon">✅</div>
          <h2 className="checkout-success-title">Thanh Toán Thành Công!</h2>
          <p className="checkout-success-text">
            Các khóa học đã có trong bảng điều khiển của bạn. Chúc học tốt!
          </p>
          <Link to="/products" className="cart-browse-btn">
            Duyệt Thêm Khóa Học
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <h1 className="cart-title">Giỏ Hàng</h1>
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2 className="cart-empty-title">Giỏ hàng trống</h2>
          <p className="cart-empty-text">Có vẻ như bạn chưa thêm khóa học nào.</p>
          <Link to="/products" className="cart-browse-btn">
            Duyệt Khóa Học
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">
        {step === 'cart' ? `Giỏ Hàng (${cartItems.length} sản phẩm)` : 'Thanh Toán'}
      </h1>

      {/* Steps */}
      <div className="checkout-steps">
        <div className={`checkout-step ${step === 'cart' ? 'active' : 'completed'}`}>
          <span className="checkout-step-num">{step === 'cart' ? '1' : '✓'}</span>
          Xem Lại Giỏ Hàng
        </div>
        <div className="checkout-step-line" />
        <div className={`checkout-step ${step === 'payment' ? 'active' : ''}`}>
          <span className="checkout-step-num">2</span>
          Thanh Toán
        </div>
        <div className="checkout-step-line" />
        <div className="checkout-step">
          <span className="checkout-step-num">3</span>
          Xác Nhận
        </div>
      </div>

      {step === 'cart' && (
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.imageUrl} alt={item.name} />
                </div>
                <div className="cart-item-info">
                  <Link to={`/products/${item.id}`} className="cart-item-name" style={{ textDecoration: 'none', color: 'inherit' }}>
                    {item.name}
                  </Link>
                  <span className="cart-item-category">{item.category}</span>
                  <span className="cart-item-seller">bởi {item.seller}</span>
                </div>
                <div className="cart-item-actions">
                  <span className="cart-item-price">${item.price}</span>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeItem(item.id)}
                  >
                    ✕ Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3 className="cart-summary-title">Tóm Tắt Đơn Hàng</h3>
            <div className="cart-summary-row">
              <span>Tạm tính ({cartItems.length} sản phẩm)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="cart-summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button className="cart-checkout-btn" onClick={() => setStep('payment')}>
              Tiến Hành Thanh Toán
            </button>
            <Link to="/products" className="cart-continue-link">
              Tiếp Tục Mua Sắm
            </Link>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div className="cart-layout">
          <div className="checkout-form">
            <h3 className="checkout-section-title">Địa Chỉ Thanh Toán</h3>
            <div className="checkout-form-group">
              <label className="checkout-label">Họ Và Tên</label>
              <input className="checkout-input" type="text" placeholder="Nguyễn Văn A" />
            </div>
            <div className="checkout-form-group">
              <label className="checkout-label">Địa Chỉ</label>
              <input className="checkout-input" type="text" placeholder="123 Đường Chính" />
            </div>
            <div className="checkout-form-row">
              <div className="checkout-form-group">
                <label className="checkout-label">Thành Phố</label>
                <input className="checkout-input" type="text" placeholder="Thành phố" />
              </div>
              <div className="checkout-form-group">
                <label className="checkout-label">Tỉnh</label>
                <input className="checkout-input" type="text" placeholder="Tỉnh" />
              </div>
              <div className="checkout-form-group">
                <label className="checkout-label">Mã Bưu Điện</label>
                <input className="checkout-input" type="text" placeholder="12345" />
              </div>
            </div>

            <h3 className="checkout-section-title" style={{ marginTop: 'var(--space-8)' }}>Phương Thức Thanh Toán</h3>
            <div className="checkout-radio-group">
              {[
                { value: 'credit-card', label: '💳 Thẻ Tín Dụng' },
                { value: 'paypal', label: '🅿️ PayPal' },
                { value: 'bank', label: '🏦 Chuyển Khoản' },
              ].map((method) => (
                <label
                  key={method.value}
                  className={`checkout-radio-label ${paymentMethod === method.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  {method.label}
                </label>
              ))}
            </div>

            {paymentMethod === 'credit-card' && (
              <>
                <div className="checkout-form-group">
                  <label className="checkout-label">Số Thẻ</label>
                  <input className="checkout-input" type="text" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="checkout-form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="checkout-form-group">
                    <label className="checkout-label">Ngày Hết Hạn</label>
                    <input className="checkout-input" type="text" placeholder="MM/YY" />
                  </div>
                  <div className="checkout-form-group">
                    <label className="checkout-label">CVV</label>
                    <input className="checkout-input" type="text" placeholder="123" />
                  </div>
                </div>
              </>
            )}

            <button className="checkout-complete-btn" onClick={() => setStep('confirmation')}>
              Hoàn Tất Mua Hàng — ${total.toFixed(2)}
            </button>
            <button
              className="cart-continue-link"
              onClick={() => setStep('cart')}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', marginTop: 'var(--space-4)' }}
            >
              ← Quay Lại Giỏ Hàng
            </button>
          </div>

          <div className="cart-summary">
            <h3 className="cart-summary-title">Tóm Tắt Đơn Hàng</h3>
            {cartItems.map((item) => (
              <div key={item.id} className="cart-summary-row">
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </span>
                <span style={{ marginLeft: '1rem' }}>${item.price}</span>
              </div>
            ))}
            <div className="cart-summary-row" style={{ marginTop: 'var(--space-2)' }}>
              <span>Thuế (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="cart-summary-total">
              <span>Tổng Cộng</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
