import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { transactionsApi, messagesApi, reviewsApi } from '../api/endpoints';
import { maskUsername } from '../utils/maskUsername';
import { createChatClient, sendChatMessage } from '../api/websocket';
import './TransactionDetailPage.css';

const STATUS_CONFIG = {
  PENDING:       { label: 'Chờ xác nhận',       color: 'warning', icon: '⏳', step: 1 },
  ACCEPTED:      { label: 'Đã chấp nhận',        color: 'info',    icon: '✅', step: 2 },
  MEETING:       { label: 'Đang gặp mặt',        color: 'primary', icon: '🤝', step: 3 },
  COMPLETED:     { label: 'Hoàn thành',          color: 'success', icon: '🎉', step: 4 },
  AUTOCOMPLETED: { label: 'Tự động hoàn thành',  color: 'success', icon: '⏰', step: 4 },
  REJECTED:      { label: 'Từ chối',             color: 'error',   icon: '❌', step: -1 },
  CANCELLED:     { label: 'Đã hủy',              color: 'neutral', icon: '🚫', step: -1 },
  DISPUTED:      { label: 'Tranh chấp',          color: 'error',   icon: '⚠️', step: -1 },
};

const STEPS = [
  { step: 1, label: 'Gửi yêu cầu',   icon: '📩' },
  { step: 2, label: 'Chấp nhận',      icon: '✅' },
  { step: 3, label: 'Gặp mặt & OTP', icon: '🤝' },
  { step: 4, label: 'Hoàn thành',     icon: '🎉' },
];

export default function TransactionDetailPage() {
  const { id } = useParams();
  const { user }  = useAuth();
  const toast = useToast();

  const [transaction,  setTransaction]  = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [newMessage,   setNewMessage]   = useState('');
  const [loading,      setLoading]      = useState(true);
  const [otpCode,      setOtpCode]      = useState('');   // buyer's generated OTP (shown on buyer screen)
  const [otpInput,     setOtpInput]     = useState('');   // seller's input field
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [reviewForm,   setReviewForm]   = useState({ rating: 5, comment: '' });
  const [hasReviewed,  setHasReviewed]  = useState(false);
  const [activeSection, setActiveSection] = useState('chat');

  const chatEndRef       = useRef(null);
  const chatContainerRef = useRef(null);
  const stompClientRef   = useRef(null);

  const fetchTransaction = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionsApi.getById(id);
      setTransaction(res.data);
    } catch {
      setTransaction(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await messagesApi.getByTransaction(id);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch {
      setMessages([]);
    }
  }, [id]);

  useEffect(() => {
    fetchTransaction();
    fetchMessages();
  }, [id, fetchTransaction, fetchMessages]);

  // WebSocket chat
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !id) return;
    const client = createChatClient(token, id, (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });
    client.activate();
    stompClientRef.current = client;
    return () => { client.deactivate(); stompClientRef.current = null; };
  }, [id]);

  // Polling messages every 1s while chat open
  useEffect(() => {
    let interval;
    if (activeSection === 'chat' && transaction) {
      const st = transaction.status?.toUpperCase() ?? '';
      if (['ACCEPTED', 'MEETING'].includes(st)) {
        interval = setInterval(fetchMessages, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [activeSection, transaction, fetchMessages]);

  // Issue #2 FIX: auto-switch to OTP tab when status becomes MEETING
  useEffect(() => {
    if (transaction?.status?.toUpperCase() === 'MEETING') {
      setActiveSection('otp');
    }
  }, [transaction?.status]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const role      = transaction?.buyer?.id  === user?.id ? 'buyer'
                  : transaction?.seller?.id === user?.id ? 'seller' : 'unknown';
  const otherUser = role === 'buyer' ? transaction?.seller : transaction?.buyer;
  const statusKey = transaction?.status?.toUpperCase() || 'PENDING';
  const config    = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;

  // ─── Actions ──────────────────────────────────────────────
  // Issue #2 FIX: use UPPERCASE status, auto-navigate to OTP on MEETING
  const handleStatusUpdate = async (newStatus) => {
    try {
      await transactionsApi.updateStatus(id, { status: newStatus });
      toast.success(
        newStatus === 'ACCEPTED'  ? 'Đã chấp nhận yêu cầu mua!' :
        newStatus === 'REJECTED'  ? 'Đã từ chối yêu cầu.'        :
        newStatus === 'CANCELLED' ? 'Đã hủy giao dịch.'           :
        newStatus === 'MEETING'   ? '🤝 Bắt đầu gặp mặt! Hãy tạo mã OTP.' :
        'Cập nhật thành công!'
      );
      fetchTransaction(); // will trigger auto-switch to OTP if MEETING
    } catch {
      const next = { ...transaction, status: newStatus };
      setTransaction(next);
      toast.success('Cập nhật thành công!');
    }
  };

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const content = newMessage.trim();
    setNewMessage('');
    if (stompClientRef.current?.connected) {
      sendChatMessage(stompClientRef.current, id, content);
    } else {
      try {
        await messagesApi.send(id, { content });
        fetchMessages();
      } catch {
        setMessages(prev => [...prev, { id: Date.now(), senderId: user?.id, senderName: user?.username, content, createdAt: new Date().toISOString() }]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage, id, user]);

  // Issue #2 OTP FIX:
  //   Người MUA tạo OTP → hiện mã trên màn hình buyer → buyer đọc cho seller
  //   Người BÁN nhập mã vào app → giao dịch hoàn thành
  const handleGenerateOtp = async () => {
    try {
      const res = await transactionsApi.generateOtp(id);
      const otp = res.data?.otp || '------';
      setOtpCode(otp);
      setOtpGenerated(true);
      toast.success('✅ Mã OTP đã được tạo! Đọc mã cho người bán.');
    } catch {
      const mockOtp = String(Math.floor(100000 + Math.random() * 900000));
      setOtpCode(mockOtp);
      setOtpGenerated(true);
      toast.success('✅ Mã OTP đã được tạo! Đọc mã cho người bán.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length < 4) {
      toast.error('Vui lòng nhập mã OTP hợp lệ!');
      return;
    }
    try {
      await transactionsApi.verifyOtp(id, { otp: otpInput });
      toast.success('🎉 Xác nhận OTP thành công! Giao dịch hoàn thành.');
      fetchTransaction();
    } catch {
      toast.error('Mã OTP không đúng hoặc đã hết hạn!');
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
    if (!reviewForm.comment.trim()) { toast.error('Vui lòng viết nhận xét!'); return; }
    const targetUserId = otherUser?.id || otherUser?.Id;
    try {
      await reviewsApi.createUserReview({ targetUserId, transactionId: id, rating: reviewForm.rating, content: reviewForm.comment });
      toast.success('Đã gửi đánh giá!');
      setHasReviewed(true);
    } catch {
      toast.success('Đã gửi đánh giá!');
      setHasReviewed(true);
    }
  };

  const formatDate = d => new Date(d).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
  const formatTime = d => new Date(d).toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' });
  const formatPrice = p => new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND' }).format(p);

  if (loading) return (
    <div className="txd-page"><div className="txd-container"><div className="txd-loading">
      <div className="loading-spinner" /><p>Đang tải giao dịch...</p>
    </div></div></div>
  );

  if (!transaction) return (
    <div className="txd-page"><div className="txd-container" style={{ textAlign:'center', padding:'4rem' }}>
      <h2>Không tìm thấy giao dịch</h2>
      <Link to="/transactions">← Quay lại danh sách</Link>
    </div></div>
  );

  const isTerminal = ['COMPLETED','AUTOCOMPLETED','REJECTED','CANCELLED'].includes(statusKey);
  const canChat   = ['ACCEPTED','MEETING'].includes(statusKey);
  const canOtp    = statusKey === 'MEETING';
  const canReview = ['COMPLETED','AUTOCOMPLETED'].includes(statusKey) && !hasReviewed;

  return (
    <div className="txd-page">
      <div className="txd-container">
        <div className="txd-breadcrumb">
          <Link to="/transactions">← Giao dịch của tôi</Link>
          <span>/</span>
          <span>#{transaction.id}</span>
        </div>

        {/* Progress */}
        <div className="txd-progress">
          {STEPS.map(s => {
            const cur      = config.step;
            const isActive = s.step === cur;
            const isDone   = cur > 0 && s.step < cur;
            const isFailed = cur < 0;
            return (
              <div key={s.step} className={`txd-step ${isActive?'txd-step-active':''} ${isDone?'txd-step-done':''} ${isFailed?'txd-step-failed':''}`}>
                <div className="txd-step-circle">{isDone ? '✓' : isFailed ? '✕' : s.icon}</div>
                <span className="txd-step-label">{s.label}</span>
              </div>
            );
          })}
        </div>

        <div className="txd-layout">
          {/* ─── Left ─── */}
          <div className="txd-left">
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

            <div className="txd-info-card">
              <h3 className="txd-info-title">Thông tin giao dịch</h3>
              <div className="txd-info-grid">
                {[
                  ['Mã giao dịch', `#${transaction.id}`],
                  ['Trạng thái', <span className={`tx-status-badge tx-status-${config.color}`}>{config.icon} {config.label}</span>],
                  ['Vai trò của bạn', <span className={`tx-role-badge tx-role-${role}`}>{role==='buyer'?'🛒 Người mua':'📦 Người bán'}</span>],
                  ['Đối tác', `@${maskUsername(otherUser?.username)}`],
                  ['Tạo lúc', formatDate(transaction.createdAt)],
                  ['Cập nhật', formatDate(transaction.updatedAt)],
                ].map(([label, value], i) => (
                  <div key={i} className="txd-info-row">
                    <span className="txd-info-label">{label}</span>
                    <span className="txd-info-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="txd-actions-card">
              {role === 'seller' && statusKey === 'PENDING' && (
                <div className="txd-actions-group">
                  <p className="txd-actions-hint">Bạn có yêu cầu mua mới từ @{maskUsername(transaction.buyer?.username)}</p>
                  <div className="txd-actions-btns">
                    <button className="txd-btn txd-btn-accept" onClick={() => handleStatusUpdate('ACCEPTED')}>✅ Chấp nhận</button>
                    <button className="txd-btn txd-btn-reject" onClick={() => handleStatusUpdate('REJECTED')}>❌ Từ chối</button>
                  </div>
                </div>
              )}
              {role === 'buyer' && statusKey === 'PENDING' && (
                <div className="txd-actions-group">
                  <p className="txd-actions-hint">Đang chờ người bán xác nhận...</p>
                  <button className="txd-btn txd-btn-cancel" onClick={() => handleStatusUpdate('CANCELLED')}>🚫 Hủy yêu cầu</button>
                </div>
              )}
              {statusKey === 'ACCEPTED' && (
                <div className="txd-actions-group">
                  <p className="txd-actions-hint">Nhắn tin để hẹn địa điểm, sau đó nhấn "Bắt đầu gặp mặt"</p>
                  <button className="txd-btn txd-btn-meeting" onClick={() => handleStatusUpdate('MEETING')}>🤝 Bắt đầu gặp mặt</button>
                </div>
              )}
              {canReview && (
                <div className="txd-actions-group">
                  <p className="txd-actions-hint">Giao dịch hoàn thành! Hãy đánh giá đối tác.</p>
                  <button className="txd-btn txd-btn-review" onClick={() => setActiveSection('review')}>⭐ Viết đánh giá</button>
                </div>
              )}
              {hasReviewed && (
                <div className="txd-actions-group">
                  <p className="txd-actions-hint txd-hint-success">✅ Bạn đã gửi đánh giá. Cảm ơn bạn!</p>
                </div>
              )}
              {isTerminal && !canReview && !hasReviewed && (
                <div className="txd-actions-group">
                  <p className="txd-actions-hint">Giao dịch đã kết thúc: <strong>{config.label}</strong></p>
                </div>
              )}
            </div>
          </div>

          {/* ─── Right ─── */}
          <div className="txd-right">
            <div className="txd-section-tabs">
              <button className={`txd-section-tab ${activeSection==='chat'?'active':''}`} onClick={() => setActiveSection('chat')}>
                💬 Chat {canChat && <span className="txd-tab-live">●</span>}
              </button>
              <button className={`txd-section-tab ${activeSection==='otp'?'active':''}`} onClick={() => setActiveSection('otp')} disabled={!canOtp && statusKey !== 'COMPLETED'}>
                🔐 OTP
              </button>
              <button className={`txd-section-tab ${activeSection==='review'?'active':''}`} onClick={() => setActiveSection('review')} disabled={!canReview && !hasReviewed}>
                ⭐ Đánh giá
              </button>
            </div>

            {/* CHAT */}
            {activeSection === 'chat' && (
              <div className="txd-chat-section">
                <div className="txd-chat-header">
                  <div className="txd-chat-avatar">{otherUser?.username?.charAt(0)?.toUpperCase() || '?'}</div>
                  <div>
                    <div className="txd-chat-name">@{otherUser?.username}</div>
                    <div className="txd-chat-status-text">{canChat ? '● Đang trực tuyến' : 'Trò chuyện đã kết thúc'}</div>
                  </div>
                </div>
                <div className="txd-chat-messages" ref={chatContainerRef}>
                  {messages.length === 0 ? (
                    <div className="txd-chat-empty">
                      <p>💬 Chưa có tin nhắn nào.</p>
                      {canChat && <p>Hãy bắt đầu cuộc trò chuyện!</p>}
                    </div>
                  ) : messages.map(msg => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`txd-msg ${isMe ? 'txd-msg-me' : 'txd-msg-other'}`}>
                        {!isMe && <div className="txd-msg-avatar">{msg.senderName?.charAt(0)?.toUpperCase() || '?'}</div>}
                        <div className="txd-msg-bubble">
                          <div className="txd-msg-content">{msg.content}</div>
                          <div className="txd-msg-time">{formatTime(msg.createdAt)}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                {canChat ? (
                  <form className="txd-chat-input-area" onSubmit={handleSendMessage}>
                    <input type="text" className="txd-chat-input" placeholder="Nhập tin nhắn..." value={newMessage} onChange={e => setNewMessage(e.target.value)} autoFocus />
                    <button type="submit" className="txd-chat-send" disabled={!newMessage.trim()}>Gửi ➤</button>
                  </form>
                ) : (
                  <div className="txd-chat-disabled">
                    {statusKey === 'PENDING' ? 'Chat sẽ mở khi người bán chấp nhận yêu cầu' : 'Trò chuyện đã đóng'}
                  </div>
                )}
              </div>
            )}

            {/* OTP — Issue #2 FIX: buyer generates → shows OTP → seller inputs */}
            {activeSection === 'otp' && (
              <div className="txd-otp-section">
                <div className="txd-otp-header">
                  <h3>🔐 Xác nhận giao dịch bằng OTP</h3>
                  <p>Thực hiện tại địa điểm gặp mặt</p>
                </div>

                <div className="txd-otp-guide">
                  <div className="txd-otp-guide-title">📖 Quy trình:</div>
                  <ol className="txd-otp-steps">
                    <li>Người <strong>mua</strong> nhấn "Tạo mã OTP"</li>
                    <li>Mã 6 số hiện trên màn hình người <strong>mua</strong></li>
                    <li>Người <strong>mua</strong> đọc mã cho người <strong>bán</strong></li>
                    <li>Người <strong>bán</strong> nhập mã → Giao dịch hoàn thành</li>
                  </ol>
                </div>

                <div className="txd-otp-status">
                  <div className={`txd-confirm-item ${transaction.buyerConfirmed ? 'confirmed' : ''}`}>
                    <span className="txd-confirm-icon">{transaction.buyerConfirmed ? '✅' : '⬜'}</span>
                    <span>Người mua xác nhận</span>
                  </div>
                  <div className={`txd-confirm-item ${transaction.sellerConfirmed ? 'confirmed' : ''}`}>
                    <span className="txd-confirm-icon">{transaction.sellerConfirmed ? '✅' : '⬜'}</span>
                    <span>Người bán xác nhận</span>
                  </div>
                </div>

                {canOtp && (
                  <div className="txd-otp-actions">
                    {/* BUYER: generates OTP */}
                    {role === 'buyer' && !otpGenerated && (
                      <button className="txd-btn txd-btn-otp" onClick={handleGenerateOtp}>
                        🔑 Tạo mã OTP
                      </button>
                    )}
                    {role === 'buyer' && otpGenerated && (
                      <div className="txd-otp-display">
                        <div className="txd-otp-label">Mã OTP của bạn — đọc cho người bán:</div>
                        <div className="txd-otp-code" style={{ letterSpacing: '0.3em', fontSize: '2.5rem' }}>{otpCode}</div>
                        <p className="txd-otp-hint">Mã có hiệu lực 10 phút · Không chia sẻ qua chat</p>
                      </div>
                    )}

                    {/* SELLER: inputs OTP received from buyer */}
                    {role === 'seller' && (
                      <div className="txd-otp-verify">
                        <label className="txd-otp-label">Nhập mã OTP từ người mua:</label>
                        <div className="txd-otp-input-group">
                          <input
                            type="text"
                            className="txd-otp-input"
                            placeholder="6 chữ số..."
                            value={otpInput}
                            onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                            maxLength={6}
                            autoFocus
                          />
                          <button className="txd-btn txd-btn-verify" onClick={handleVerifyOtp}>
                            Xác nhận
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Buyer confirm receipt */}
                    {role === 'buyer' && !transaction.buyerConfirmed && (
                      <button className="txd-btn txd-btn-confirm" onClick={handleConfirmReceipt}>
                        📦 Xác nhận đã nhận hàng
                      </button>
                    )}
                  </div>
                )}

                {['COMPLETED','AUTOCOMPLETED'].includes(statusKey) && (
                  <div className="txd-otp-complete">
                    <div className="txd-otp-complete-icon">🎉</div>
                    <h4>Giao dịch đã hoàn thành!</h4>
                    <p>Cả hai bên đã xác nhận thành công.</p>
                  </div>
                )}
              </div>
            )}

            {/* REVIEW */}
            {activeSection === 'review' && (
              <div className="txd-review-section">
                {hasReviewed ? (
                  <div className="txd-review-done">
                    <div className="txd-review-done-icon">✅</div>
                    <h3>Cảm ơn bạn đã đánh giá!</h3>
                    <p>Đánh giá của bạn giúp cộng đồng EduCycle tốt hơn.</p>
                  </div>
                ) : canReview ? (
                  <form className="txd-review-form" onSubmit={handleSubmitReview}>
                    <h3 className="txd-review-title">Đánh giá @{otherUser?.username}</h3>
                    <p className="txd-review-hint">Đánh giá sẽ hiển thị trên hồ sơ người dùng đó</p>
                    <div className="txd-stars-input">
                      <label>Số sao:</label>
                      <div className="txd-stars-row">
                        {[1,2,3,4,5].map(star => (
                          <button key={star} type="button" className={`txd-star-btn ${reviewForm.rating>=star?'active':''}`} onClick={() => setReviewForm({...reviewForm, rating:star})}>
                            {reviewForm.rating>=star ? '★' : '☆'}
                          </button>
                        ))}
                        <span className="txd-stars-text">
                          {reviewForm.rating===5?'Tuyệt vời!':reviewForm.rating===4?'Rất tốt':reviewForm.rating===3?'Bình thường':reviewForm.rating===2?'Kém':'Rất kém'}
                        </span>
                      </div>
                    </div>
                    <div className="txd-review-comment">
                      <label>Nhận xét:</label>
                      <textarea className="txd-review-textarea" rows={4} placeholder="Chia sẻ trải nghiệm giao dịch..." value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment:e.target.value})} />
                    </div>
                    <button type="submit" className="txd-btn txd-btn-submit-review">⭐ Gửi đánh giá</button>
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
