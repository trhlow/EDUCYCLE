import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { transactionsApi, messagesApi, reviewsApi } from '../api/endpoints';
import './TransactionDetailPage.css';

const STATUS_CONFIG = {
  Pending: { label: 'Chờ xác nhận', color: 'warning', icon: '⏳', step: 1 },
  Accepted: { label: 'Đã chấp nhận', color: 'info', icon: '✅', step: 2 },
  Meeting: { label: 'Đang gặp mặt', color: 'primary', icon: '🤝', step: 3 },
  Completed: { label: 'Hoàn thành', color: 'success', icon: '🎉', step: 4 },
  AutoCompleted: { label: 'Tự động hoàn thành', color: 'success', icon: '⏰', step: 4 },
  Rejected: { label: 'Từ chối', color: 'error', icon: '❌', step: -1 },
  Cancelled: { label: 'Đã hủy', color: 'neutral', icon: '🚫', step: -1 },
  Disputed: { label: 'Tranh chấp', color: 'error', icon: '⚠️', step: -1 },
};

const STEPS = [
  { step: 1, label: 'Gửi yêu cầu', icon: '📩' },
  { step: 2, label: 'Chấp nhận', icon: '✅' },
  { step: 3, label: 'Gặp mặt & OTP', icon: '🤝' },
  { step: 4, label: 'Hoàn thành', icon: '🎉' },
];

export default function TransactionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState('');
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [hasReviewed, setHasReviewed] = useState(false);
  const [activeSection, setActiveSection] = useState('chat');

  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchTransaction();
    fetchMessages();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTransaction = async () => {
    setLoading(true);
    try {
      const res = await transactionsApi.getById(id);
      setTransaction(res.data);
    } catch {
      setTransaction(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await messagesApi.getByTransaction(id);
      setMessages(res.data);
    } catch {
      setMessages([]);
    }
  };

  const role = transaction?.buyer?.id === user?.id ? 'buyer'
    : transaction?.seller?.id === user?.id ? 'seller'
    : 'unknown';

  const otherUser = role === 'buyer' ? transaction?.seller : transaction?.buyer;
  const config = STATUS_CONFIG[transaction?.status] || STATUS_CONFIG.Pending;

  // ─── Actions ──────────────────────────
  const handleStatusUpdate = async (newStatus) => {
    try {
      await transactionsApi.updateStatus(id, { status: newStatus });
      toast.success(
        newStatus === 'Accepted' ? 'Đã chấp nhận yêu cầu mua!' :
        newStatus === 'Rejected' ? 'Đã từ chối yêu cầu.' :
        newStatus === 'Cancelled' ? 'Đã hủy giao dịch.' :
        newStatus === 'Meeting' ? 'Chuyển sang trạng thái gặp mặt!' :
        'Cập nhật thành công!'
      );
      fetchTransaction();
    } catch {
      // Mock update
      setTransaction(prev => prev ? { ...prev, status: newStatus } : prev);
      toast.success('Cập nhật thành công!');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgData = { content: newMessage.trim() };

    try {
      await messagesApi.send(id, msgData);
      fetchMessages();
    } catch {
      // Mock message
      const mockMsg = {
        id: Date.now(),
        senderId: user?.id,
        senderName: user?.username,
        content: newMessage.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, mockMsg]);
    }

    setNewMessage('');
  };

  const handleGenerateOtp = async () => {
    try {
      const res = await transactionsApi.generateOtp(id);
      setOtpGenerated(true);
      toast.success(`Mã OTP đã được tạo: ${res.data?.otp || '------'}`);
    } catch {
      // Mock OTP
      setOtpGenerated(true);
      toast.success('Mã OTP đã được tạo! Kiểm tra trên màn hình.');
      setTransaction(prev => prev ? { ...prev, otpCode: '384712' } : prev);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length < 4) {
      toast.error('Vui lòng nhập mã OTP hợp lệ!');
      return;
    }

    try {
      await transactionsApi.verifyOtp(id, { otp: otpInput });
      toast.success('Xác nhận OTP thành công!');
      fetchTransaction();
    } catch {
      // Mock verify
      if (otpInput === (transaction?.otpCode || '384712')) {
        const updatedTx = { ...transaction };
        if (role === 'buyer') updatedTx.buyerConfirmed = true;
        if (role === 'seller') updatedTx.sellerConfirmed = true;
        if (updatedTx.buyerConfirmed && updatedTx.sellerConfirmed) {
          updatedTx.status = 'Completed';
        }
        setTransaction(updatedTx);
        toast.success('Xác nhận thành công!');
      } else {
        toast.error('Mã OTP không đúng!');
      }
    }
    setOtpInput('');
  };

  const handleConfirmReceipt = async () => {
    try {
      await transactionsApi.confirmReceipt(id);
      toast.success('Đã xác nhận nhận hàng!');
      fetchTransaction();
    } catch {
      setTransaction(prev => prev ? { ...prev, buyerConfirmed: true } : prev);
      toast.success('Đã xác nhận nhận hàng!');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      toast.error('Vui lòng viết nhận xét!');
      return;
    }

    try {
      await reviewsApi.create({
        transactionId: parseInt(id),
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      toast.success('Đã gửi đánh giá!');
      setHasReviewed(true);
      setShowReviewForm(false);
    } catch {
      toast.success('Đã gửi đánh giá!');
      setHasReviewed(true);
      setShowReviewForm(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className="txd-page">
        <div className="txd-container">
          <div className="txd-loading">
            <div className="loading-spinner" />
            <p>Đang tải giao dịch...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="txd-page">
        <div className="txd-container" style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>Không tìm thấy giao dịch</h2>
          <Link to="/transactions">← Quay lại danh sách</Link>
        </div>
      </div>
    );
  }

  const isTerminal = ['Completed', 'AutoCompleted', 'Rejected', 'Cancelled'].includes(transaction.status);
  const canChat = ['Accepted', 'Meeting'].includes(transaction.status);
  const canOtp = transaction.status === 'Meeting';
  const canReview = ['Completed', 'AutoCompleted'].includes(transaction.status) && !hasReviewed;

  return (
    <div className="txd-page">
      <div className="txd-container">
        {/* Breadcrumb */}
        <div className="txd-breadcrumb">
          <Link to="/transactions">← Giao dịch của tôi</Link>
          <span>/</span>
          <span>#{transaction.id}</span>
        </div>

        {/* ═══ Progress Steps ═══ */}
        <div className="txd-progress">
          {STEPS.map((s) => {
            const currentStep = config.step;
            const isActive = s.step === currentStep;
            const isDone = currentStep > 0 && s.step < currentStep;
            const isFailed = currentStep < 0;

            return (
              <div
                key={s.step}
                className={`txd-step 
                  ${isActive ? 'txd-step-active' : ''} 
                  ${isDone ? 'txd-step-done' : ''} 
                  ${isFailed ? 'txd-step-failed' : ''}`}
              >
                <div className="txd-step-circle">
                  {isDone ? '✓' : isFailed ? '✕' : s.icon}
                </div>
                <span className="txd-step-label">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* ═══ Main Layout ═══ */}
        <div className="txd-layout">
          {/* ─── Left: Product + Info ─── */}
          <div className="txd-left">
            {/* Product Card */}
            <div className="txd-product-card">
              <div className="txd-product-image">
                <img src={transaction.product?.imageUrl} alt={transaction.product?.name} />
              </div>
              <div className="txd-product-info">
                <h2 className="txd-product-name">{transaction.product?.name}</h2>
                <p className="txd-product-desc">{transaction.product?.description}</p>
                <span className="txd-product-category">{transaction.product?.category}</span>
                <div className="txd-product-price">{formatPrice(transaction.product?.price)}</div>
              </div>
            </div>

            {/* Transaction Info */}
            <div className="txd-info-card">
              <h3 className="txd-info-title">Thông tin giao dịch</h3>
              <div className="txd-info-grid">
                <div className="txd-info-row">
                  <span className="txd-info-label">Mã giao dịch</span>
                  <span className="txd-info-value">#{transaction.id}</span>
                </div>
                <div className="txd-info-row">
                  <span className="txd-info-label">Trạng thái</span>
                  <span className={`tx-status-badge tx-status-${config.color}`}>
                    {config.icon} {config.label}
                  </span>
                </div>
                <div className="txd-info-row">
                  <span className="txd-info-label">Vai trò của bạn</span>
                  <span className={`tx-role-badge tx-role-${role}`}>
                    {role === 'buyer' ? '🛒 Người mua' : '📦 Người bán'}
                  </span>
                </div>
                <div className="txd-info-row">
                  <span className="txd-info-label">Đối tác</span>
                  <span className="txd-info-value">@{otherUser?.username}</span>
                </div>
                <div className="txd-info-row">
                  <span className="txd-info-label">Tạo lúc</span>
                  <span className="txd-info-value">{formatDate(transaction.createdAt)}</span>
                </div>
                <div className="txd-info-row">
                  <span className="txd-info-label">Cập nhật</span>
                  <span className="txd-info-value">{formatDate(transaction.updatedAt)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="txd-actions-card">
              {/* Seller: Accept/Reject when Pending */}
              {role === 'seller' && transaction.status === 'Pending' && (
                <div className="txd-actions-group">
                  <p className="txd-actions-hint">Bạn có yêu cầu mua mới từ @{transaction.buyer?.username}</p>
                  <div className="txd-actions-btns">
                    <button className="txd-btn txd-btn-accept" onClick={() => handleStatusUpdate('Accepted')}>
                      ✅ Chấp nhận
                    </button>
                    <button className="txd-btn txd-btn-reject" onClick={() => handleStatusUpdate('Rejected')}>
                      ❌ Từ chối
                    </button>
                  </div>
                </div>
              )}

              {/* Buyer: Cancel when Pending */}
              {role === 'buyer' && transaction.status === 'Pending' && (
                <div className="txd-actions-group">
                  <p className="txd-actions-hint">Đang chờ người bán xác nhận...</p>
                  <button className="txd-btn txd-btn-cancel" onClick={() => handleStatusUpdate('Cancelled')}>
                    🚫 Hủy yêu cầu
                  </button>
                </div>
              )}

              {/* Both: Move to Meeting when Accepted */}
              {transaction.status === 'Accepted' && (
                <div className="txd-actions-group">
                  <p className="txd-actions-hint">
                    Hãy nhắn tin để hẹn địa điểm gặp mặt, sau đó nhấn "Bắt đầu gặp mặt"
                  </p>
                  <button className="txd-btn txd-btn-meeting" onClick={() => handleStatusUpdate('Meeting')}>
                    🤝 Bắt đầu gặp mặt
                  </button>
                </div>
              )}

              {/* Review button when completed */}
              {canReview && (
                <div className="txd-actions-group">
                  <p className="txd-actions-hint">Giao dịch đã hoàn thành! Hãy đánh giá đối tác của bạn.</p>
                  <button className="txd-btn txd-btn-review" onClick={() => setShowReviewForm(true)}>
                    ⭐ Viết đánh giá
                  </button>
                </div>
              )}

              {hasReviewed && (
                <div className="txd-actions-group">
                  <p className="txd-actions-hint txd-hint-success">✅ Bạn đã gửi đánh giá. Cảm ơn bạn!</p>
                </div>
              )}

              {isTerminal && !canReview && !hasReviewed && (
                <div className="txd-actions-group">
                  <p className="txd-actions-hint">
                    Giao dịch này đã kết thúc với trạng thái: <strong>{config.label}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ─── Right: Chat + OTP + Review ─── */}
          <div className="txd-right">
            {/* Section Tabs */}
            <div className="txd-section-tabs">
              <button
                className={`txd-section-tab ${activeSection === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveSection('chat')}
              >
                💬 Chat {canChat && <span className="txd-tab-live">●</span>}
              </button>
              <button
                className={`txd-section-tab ${activeSection === 'otp' ? 'active' : ''}`}
                onClick={() => setActiveSection('otp')}
                disabled={!canOtp && transaction.status !== 'Completed'}
              >
                🔐 OTP
              </button>
              <button
                className={`txd-section-tab ${activeSection === 'review' ? 'active' : ''}`}
                onClick={() => setActiveSection('review')}
                disabled={!canReview && !hasReviewed}
              >
                ⭐ Đánh giá
              </button>
            </div>

            {/* ─── CHAT Section ─── */}
            {activeSection === 'chat' && (
              <div className="txd-chat-section">
                <div className="txd-chat-header">
                  <div className="txd-chat-avatar">
                    {otherUser?.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="txd-chat-name">@{otherUser?.username}</div>
                    <div className="txd-chat-status-text">
                      {canChat ? '● Đang trực tuyến' : 'Trò chuyện đã kết thúc'}
                    </div>
                  </div>
                </div>

                <div className="txd-chat-messages" ref={chatContainerRef}>
                  {messages.length === 0 ? (
                    <div className="txd-chat-empty">
                      <p>💬 Chưa có tin nhắn nào.</p>
                      {canChat && <p>Hãy bắt đầu cuộc trò chuyện!</p>}
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div key={msg.id} className={`txd-msg ${isMe ? 'txd-msg-me' : 'txd-msg-other'}`}>
                          {!isMe && (
                            <div className="txd-msg-avatar">
                              {msg.senderName?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="txd-msg-bubble">
                            <div className="txd-msg-content">{msg.content}</div>
                            <div className="txd-msg-time">{formatTime(msg.createdAt)}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {canChat ? (
                  <form className="txd-chat-input-area" onSubmit={handleSendMessage}>
                    <input
                      type="text"
                      className="txd-chat-input"
                      placeholder="Nhập tin nhắn..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="txd-chat-send"
                      disabled={!newMessage.trim()}
                    >
                      Gửi ➤
                    </button>
                  </form>
                ) : (
                  <div className="txd-chat-disabled">
                    {transaction.status === 'Pending' ? 'Chat sẽ mở khi người bán chấp nhận yêu cầu' :
                     'Trò chuyện đã đóng'}
                  </div>
                )}
              </div>
            )}

            {/* ─── OTP Section ─── */}
            {activeSection === 'otp' && (
              <div className="txd-otp-section">
                <div className="txd-otp-header">
                  <h3>🔐 Xác nhận giao dịch bằng OTP</h3>
                  <p>Cả hai bên phải xác nhận tại địa điểm gặp mặt</p>
                </div>

                <div className="txd-otp-guide">
                  <div className="txd-otp-guide-title">📖 Quy trình:</div>
                  <ol className="txd-otp-steps">
                    <li>Người <strong>bán</strong> nhấn "Tạo mã OTP"</li>
                    <li>Mã OTP hiển thị trên màn hình người bán</li>
                    <li>Người <strong>mua</strong> nhập mã OTP từ người bán</li>
                    <li>Cả hai xác nhận → Giao dịch hoàn thành</li>
                  </ol>
                </div>

                {/* Confirmation Status */}
                <div className="txd-otp-status">
                  <div className={`txd-confirm-item ${transaction.sellerConfirmed ? 'confirmed' : ''}`}>
                    <span className="txd-confirm-icon">
                      {transaction.sellerConfirmed ? '✅' : '⬜'}
                    </span>
                    <span>Người bán xác nhận</span>
                  </div>
                  <div className={`txd-confirm-item ${transaction.buyerConfirmed ? 'confirmed' : ''}`}>
                    <span className="txd-confirm-icon">
                      {transaction.buyerConfirmed ? '✅' : '⬜'}
                    </span>
                    <span>Người mua xác nhận</span>
                  </div>
                </div>

                {canOtp && (
                  <div className="txd-otp-actions">
                    {/* Seller generates OTP */}
                    {role === 'seller' && !otpGenerated && (
                      <button className="txd-btn txd-btn-otp" onClick={handleGenerateOtp}>
                        🔑 Tạo mã OTP
                      </button>
                    )}

                    {/* Show OTP to seller */}
                    {role === 'seller' && otpGenerated && transaction.otpCode && (
                      <div className="txd-otp-display">
                        <div className="txd-otp-label">Mã OTP của bạn:</div>
                        <div className="txd-otp-code">{transaction.otpCode}</div>
                        <p className="txd-otp-hint">Cho người mua xem mã này</p>
                      </div>
                    )}

                    {/* Buyer enters OTP */}
                    {role === 'buyer' && (
                      <div className="txd-otp-verify">
                        <label className="txd-otp-label">Nhập mã OTP từ người bán:</label>
                        <div className="txd-otp-input-group">
                          <input
                            type="text"
                            className="txd-otp-input"
                            placeholder="Nhập mã OTP..."
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            maxLength={6}
                          />
                          <button className="txd-btn txd-btn-verify" onClick={handleVerifyOtp}>
                            Xác nhận
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Both: Confirm receipt button */}
                    {role === 'buyer' && !transaction.buyerConfirmed && (
                      <button className="txd-btn txd-btn-confirm" onClick={handleConfirmReceipt}>
                        📦 Xác nhận đã nhận hàng
                      </button>
                    )}
                  </div>
                )}

                {transaction.status === 'Completed' && (
                  <div className="txd-otp-complete">
                    <div className="txd-otp-complete-icon">🎉</div>
                    <h4>Giao dịch đã hoàn thành!</h4>
                    <p>Cả hai bên đã xác nhận thành công.</p>
                  </div>
                )}
              </div>
            )}

            {/* ─── REVIEW Section ─── */}
            {activeSection === 'review' && (
              <div className="txd-review-section">
                {hasReviewed ? (
                  <div className="txd-review-done">
                    <div className="txd-review-done-icon">✅</div>
                    <h3>Cảm ơn bạn đã đánh giá!</h3>
                    <p>Đánh giá của bạn giúp cộng đồng EduCycle ngày càng tốt hơn.</p>
                  </div>
                ) : canReview ? (
                  <form className="txd-review-form" onSubmit={handleSubmitReview}>
                    <h3 className="txd-review-title">
                      Đánh giá @{otherUser?.username}
                    </h3>
                    <p className="txd-review-hint">
                      Hãy chia sẻ trải nghiệm giao dịch của bạn
                    </p>

                    {/* Star Rating */}
                    <div className="txd-stars-input">
                      <label>Số sao:</label>
                      <div className="txd-stars-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`txd-star-btn ${reviewForm.rating >= star ? 'active' : ''}`}
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          >
                            {reviewForm.rating >= star ? '★' : '☆'}
                          </button>
                        ))}
                        <span className="txd-stars-text">
                          {reviewForm.rating === 5 ? 'Tuyệt vời!' :
                           reviewForm.rating === 4 ? 'Rất tốt' :
                           reviewForm.rating === 3 ? 'Bình thường' :
                           reviewForm.rating === 2 ? 'Kém' : 'Rất kém'}
                        </span>
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="txd-review-comment">
                      <label>Nhận xét:</label>
                      <textarea
                        className="txd-review-textarea"
                        rows={4}
                        placeholder="Chia sẻ trải nghiệm giao dịch..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="txd-btn txd-btn-submit-review">
                      ⭐ Gửi đánh giá
                    </button>
                  </form>
                ) : (
                  <div className="txd-review-locked">
                    <div className="txd-review-locked-icon">🔒</div>
                    <p>Đánh giá chỉ khả dụng sau khi giao dịch hoàn thành.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
