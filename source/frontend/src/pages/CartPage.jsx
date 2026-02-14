import { useState } from 'react';
import { Link } from 'react-router-dom';
import './CartPage.css';

const INITIAL_CART = [
  {
    id: '1',
    name: 'Advanced Python Programming Course',
    category: 'Programming',
    seller: 'CodeMaster Pro',
    price: 49.99,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop',
  },
  {
    id: '2',
    name: 'Complete Web Development Bootcamp',
    category: 'Web Development',
    seller: 'WebDev Academy',
    price: 89.99,
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop',
  },
  {
    id: '3',
    name: 'Data Science Fundamentals',
    category: 'Data Science',
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
          <h2 className="checkout-success-title">Payment Successful!</h2>
          <p className="checkout-success-text">
            Your courses are now available in your dashboard. Happy learning!
          </p>
          <Link to="/products" className="cart-browse-btn">
            Browse More Courses
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <h1 className="cart-title">Shopping Cart</h1>
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2 className="cart-empty-title">Your cart is empty</h2>
          <p className="cart-empty-text">Looks like you haven't added any courses yet.</p>
          <Link to="/products" className="cart-browse-btn">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">
        {step === 'cart' ? `Shopping Cart (${cartItems.length} items)` : 'Checkout'}
      </h1>

      {/* Steps */}
      <div className="checkout-steps">
        <div className={`checkout-step ${step === 'cart' ? 'active' : 'completed'}`}>
          <span className="checkout-step-num">{step === 'cart' ? '1' : '✓'}</span>
          Cart Review
        </div>
        <div className="checkout-step-line" />
        <div className={`checkout-step ${step === 'payment' ? 'active' : ''}`}>
          <span className="checkout-step-num">2</span>
          Payment
        </div>
        <div className="checkout-step-line" />
        <div className="checkout-step">
          <span className="checkout-step-num">3</span>
          Confirmation
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
                  <span className="cart-item-seller">by {item.seller}</span>
                </div>
                <div className="cart-item-actions">
                  <span className="cart-item-price">${item.price}</span>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeItem(item.id)}
                  >
                    ✕ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3 className="cart-summary-title">Order Summary</h3>
            <div className="cart-summary-row">
              <span>Subtotal ({cartItems.length} items)</span>
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
              Proceed to Checkout
            </button>
            <Link to="/products" className="cart-continue-link">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div className="cart-layout">
          <div className="checkout-form">
            <h3 className="checkout-section-title">Billing Address</h3>
            <div className="checkout-form-group">
              <label className="checkout-label">Full Name</label>
              <input className="checkout-input" type="text" placeholder="John Doe" />
            </div>
            <div className="checkout-form-group">
              <label className="checkout-label">Address</label>
              <input className="checkout-input" type="text" placeholder="123 Main Street" />
            </div>
            <div className="checkout-form-row">
              <div className="checkout-form-group">
                <label className="checkout-label">City</label>
                <input className="checkout-input" type="text" placeholder="City" />
              </div>
              <div className="checkout-form-group">
                <label className="checkout-label">State</label>
                <input className="checkout-input" type="text" placeholder="State" />
              </div>
              <div className="checkout-form-group">
                <label className="checkout-label">ZIP</label>
                <input className="checkout-input" type="text" placeholder="12345" />
              </div>
            </div>

            <h3 className="checkout-section-title" style={{ marginTop: 'var(--space-8)' }}>Payment Method</h3>
            <div className="checkout-radio-group">
              {[
                { value: 'credit-card', label: '💳 Credit Card' },
                { value: 'paypal', label: '🅿️ PayPal' },
                { value: 'bank', label: '🏦 Bank Transfer' },
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
                  <label className="checkout-label">Card Number</label>
                  <input className="checkout-input" type="text" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="checkout-form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="checkout-form-group">
                    <label className="checkout-label">Expiry Date</label>
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
              Complete Purchase — ${total.toFixed(2)}
            </button>
            <button
              className="cart-continue-link"
              onClick={() => setStep('cart')}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', marginTop: 'var(--space-4)' }}
            >
              ← Back to Cart
            </button>
          </div>

          <div className="cart-summary">
            <h3 className="cart-summary-title">Order Summary</h3>
            {cartItems.map((item) => (
              <div key={item.id} className="cart-summary-row">
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </span>
                <span style={{ marginLeft: '1rem' }}>${item.price}</span>
              </div>
            ))}
            <div className="cart-summary-row" style={{ marginTop: 'var(--space-2)' }}>
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="cart-summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
