import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { transactionsApi, messagesApi, reviewsApi } from '../api/endpoints';
import { maskUsername } from '../utils/maskUsername';
import { createChatClient, sendChatMessage } from '../api/websocket';
import './TransactionDetailPage.css';

const STATUS_CONFIG = {
  PENDING:       { label: 'Chờ xác nhận',       color: 'warning', step: 1 },
  ACCEPTED:      { label: 'Đã chấp nhận',        color: 'info',    step: 3 },
  MEETING:       { label: 'Đang gặp mặt',        color: 'primary', step: 3 },
  COMPLETED:     { label: 'Hoàn thành',          color: 'success', step: 4 },
  AUTOCOMPLETED: { label: 'Tự động hoàn thành',  color: 'success', step: 4 },
  REJECTED:      { label: 'Từ chối',             color: 'error',   step: -1 },
  CANCELLED:     { label: 'Đã hủy',              color: 'neutral', step: -1 },
  DISPUTED:      { label: 'Tranh chấp',          color: 'error',   step: -1 },
};

const STEPS = [
  { step: 1, label: 'Gửi yêu cầu' },
  { step: 2, label: 'Chấp nhận' },
  { step: 3, label: 'OTP & hoàn tất' },
  { step: 4, label: 'Hoàn thành' },
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
  const [disputeReasonInput, setDisputeReasonInput] = useState('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  const chatEndRef       = useRef(null);
  const chatContainerRef = useRef(null);
  const stompClientRef   = useRef(null);

  /** silent=true: không full-screen loading, không xóa transaction khi lỗi mạng/429 */
  const fetchTransaction = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await transactionsApi.getById(id);
        setTransaction(res.data);
      } catch (e) {
        const msg = e?.response?.data?.message || e?.response?.data?.error;
        setTransaction((prev) => {
          if (silent && prev) return prev;
          return null;
        });
        if (!silent) {
          toast.error(typeof msg === 'string' ? msg : 'Không tải được giao dịch.');
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id, toast],
  );

  /** preserveOnError: không xóa chat khi một lần poll thất bại (429, mạng) */
  const fetchMessages = useCallback(
    async (preserveOnError = false) => {
      try {
        const res = await messagesApi.getByTransaction(id);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!preserveOnError) setMessages([]);
      }
    },
    [id],
  );

  useEffect(() => {
    fetchTransaction(false);
    fetchMessages(false);
  }, [id, fetchTransaction, fetchMessages]);

  // Làm mới WebSocket khi JWT được refresh (axios interceptor)
  const [wsEpoch, setWsEpoch] = useState(0);
  useEffect(() => {
    const bump = () => setWsEpoch((n) => n + 1);
    window.addEventListener('educycle:token-refreshed', bump);
    return () => window.removeEventListener('educycle:token-refreshed', bump);
  }, []);

  // WebSocket chat
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !id) return;
    const client = createChatClient(token, id, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });
    client.activate();
    stompClientRef.current = client;
    return () => {
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [id, wsEpoch]);

  // Polling dự phòng — 8s để tránh chạm 60 req/phút (trước đây 1s dễ 429 → mất tin nhắn)
  useEffect(() => {
    let interval;
    if (activeSection === 'chat' && transaction) {
      const st = transaction.status?.toUpperCase() ?? '';
      if (['ACCEPTED', 'MEETING'].includes(st)) {
        interval = setInterval(() => fetchMessages(true), 8000);
      }
    }
    return () => clearInterval(interval);
  }, [activeSection, transaction, fetchMessages]);

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
        'Cập nhật thành công!'
      );
      await fetchTransaction(true);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Không cập nhật được trạng thái. Kiểm tra kết nối hoặc quyền.');
    }
  };

  const handleCancelTransaction = async () => {
    if (!window.confirm('Hủy giao dịch này? Hai bên sẽ không thể tiếp tục.')) return;
    setCancelSubmitting(true);
    try {
      const body = cancelReasonInput.trim() ? { reason: cancelReasonInput.trim() } : {};
      await transactionsApi.cancel(id, body);
      toast.success('Đã hủy giao dịch.');
      setCancelReasonInput('');
      await fetchTransaction(true);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Không hủy được giao dịch.');
    } finally {
      setCancelSubmitting(false);
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
        fetchMessages(true);
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
      toast.success('Mã OTP đã được tạo. Đọc mã cho người bán.');
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Không tạo được mã OTP. Chỉ người mua được tạo mã.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length < 4) {
      toast.error('Vui lòng nhập mã OTP hợp lệ!');
      return;
    }
    try {
      await transactionsApi.verifyOtp(id, { otp: otpInput });
      toast.success('Xác nhận OTP thành công. Giao dịch hoàn thành.');
      await fetchTransaction(true);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Mã OTP không đúng, hết hạn, hoặc bạn không phải người bán.');
    }
    setOtpInput('');
  };

  const handleConfirmReceipt = async () => {
    try {
      await transactionsApi.confirmReceipt(id);
      toast.success('Đã xác nhận nhận hàng!');
      await fetchTransaction(true);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Không xác nhận được. Thử lại.');
    }
  };

  const handleOpenDispute = async () => {
    if (!window.confirm('Báo tranh chấp cho admin? Hai bên sẽ chờ admin xử lý trước khi tiếp tục.')) return;
    setDisputeSubmitting(true);
    try {
      const body = disputeReasonInput.trim() ? { reason: disputeReasonInput.trim() } : {};
      await transactionsApi.openDispute(id, body);
      toast.success('Đã gửi báo tranh chấp. Admin sẽ xem xét.');
      setDisputeReasonInput('');
      await fetchTransaction(true);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Không gửi được báo tranh chấp.');
    } finally {
      setDisputeSubmitting(false);
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
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Gửi đánh giá thất bại. Thử lại.');
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
      <Link to="/transactions">Quay lại danh sách</Link>
    </div></div>
  );

  const isTerminal = ['COMPLETED','AUTOCOMPLETED','REJECTED','CANCELLED','DISPUTED'].includes(statusKey);
  const canChat   = ['ACCEPTED','MEETING'].includes(statusKey);
  const canOtp    = ['ACCEPTED','MEETING'].includes(statusKey);
  const canReview = ['COMPLETED','AUTOCOMPLETED'].includes(statusKey) && !hasReviewed;
  const canDispute = role === 'buyer' && ['ACCEPTED','MEETING'].includes(statusKey);
  const canCancelAccepted = ['ACCEPTED','MEETING'].includes(statusKey) && !isTerminal;

  return (
    <div className="txd-page">
      <div className="txd-container">
        <div className="txd-breadcrumb">
          <Link to="/transactions">Giao dịch của tôi</Link>
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
                <div className="txd-step-circle">{s.step}</div>
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
                  ['Trạng thái', <span className={`tx-status-badge tx-status-${config.color}`}>{config.label}</span>],
                  ['Vai trò của bạn', <span className={`tx-role-badge tx-role-${role}`}>{role==='buyer'?'Người mua':'Người bán'}</span>],
                  ['Đối tác', `@${maskUsername(otherUser?.username)}`],
                  ['Tạo lúc', formatDate(transaction.createdAt)],
                  ['Cập nhật', formatDate(transaction.updatedAt)],
                  ...(statusKey === 'CANCELLED' && transaction.cancelReason
                    ? [['Lý do hủy', transaction.cancelReason]]
                    : []),
                  ...(statusKey === 'CANCELLED' && transaction.cancelledAt
                    ? [['Hủy lúc', formatDate(transaction.cancelledAt)]]
                    : []),
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
                    <button className="txd-btn txd-btn-accept" onClick={() => handleStatusUpdate('ACCEPTED')}>Chấp nhận</button>
                    <button className="txd-btn txd-btn-reject" onClick={() => handleStatusUpdate('REJECTED')}>Từ chối</button>
                  </div>
                </div>
              )}
              {role === 'buyer' && statusKey === 'PENDING' && (
                <div className="txd-actions-group">
                  <p className="txd-actions-hint">Đang chờ người bán xác nhận...</p>
                  <button type="button" className="txd-btn txd-btn-cancel" disabled={cancelSubmitting} onClick={handleCancelTransaction}>Hủy yêu cầu</button>
                </div>
              )}
              {canCancelAccepted && (
                <div className="txd-actions-group">
                  <p className="txd-actions-hint">Nhắn tin để hẹn địa điểm; khi gặp trực tiếp, người mua tạo mã OTP ở tab OTP. Hai bên đều có thể hủy giao dịch (kèm lý do tuỳ chọn).</p>
                  <textarea
                    className="auth-input"
                    style={{ width: '100%', minHeight: 72, marginBottom: 'var(--space-2)', resize: 'vertical' }}
                    placeholder="Lý do hủy (tuỳ chọn)..."
                    value={cancelReasonInput}
                    onChange={(e) => setCancelReasonInput(e.target.value)}
                    maxLength={2000}
                    aria-label="Lý do hủy giao dịch"
                  />
                  <button type="button" className="txd-btn txd-btn-cancel" disabled={cancelSubmitting} onClick={handleCancelTransaction}>
                    {cancelSubmitting ? 'Đang xử lý...' : 'Hủy giao dịch'}
                  </button>
                </div>
              )}
              {canDispute && (
                <div className="txd-actions-group" style={{ border: '1px solid var(--error-light, #ffcdd2)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
                  <p className="txd-actions-hint">Có vấn đề sau khi đã chấp nhận? Chỉ <strong>người mua</strong> có thể báo tranh chấp để admin hỗ trợ.</p>
                  <textarea
                    className="auth-input"
                    style={{ width: '100%', minHeight: 72, marginBottom: 'var(--space-2)', resize: 'vertical' }}
                    placeholder="Mô tả ngắn (không bắt buộc)..."
                    value={disputeReasonInput}
                    onChange={(e) => setDisputeReasonInput(e.target.value)}
                    maxLength={2000}
                  />
                  <button type="button" className="txd-btn txd-btn-cancel" disabled={disputeSubmitting} onClick={handleOpenDispute}>
                    {disputeSubmitting ? 'Đang gửi...' : 'Báo tranh chấp'}
                  </button>
                </div>
              )}
              {statusKey === 'DISPUTED' && (
                <div className="txd-actions-group" style={{ background: 'var(--error-light, #ffebee)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
                  <p className="txd-actions-hint" style={{ fontWeight: 600 }}>Giao dịch đang tranh chấp — chờ admin xử lý</p>
                  {transaction.disputeReason && (
                    <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}><strong>Lý do:</strong> {transaction.disputeReason}</p>
                  )}
                  {transaction.disputedAt && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Báo lúc: {formatDate(transaction.disputedAt)}</p>
                  )}
                </div>
              )}
              {canReview && (
                <div className="txd-actions-group">
                  <p className="txd-actions-hint">Giao dịch hoàn thành! Hãy đánh giá đối tác.</p>
                  <button className="txd-btn txd-btn-review" onClick={() => setActiveSection('review')}>Viết đánh giá</button>
                </div>
              )}
              {hasReviewed && (
                <div className="txd-actions-group">
                  <p className="txd-actions-hint txd-hint-success">Bạn đã gửi đánh giá. Cảm ơn bạn.</p>
                </div>
              )}
              {isTerminal && !canReview && !hasReviewed && statusKey !== 'DISPUTED' && (
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
                Chat {canChat && <span className="txd-tab-live">trực tuyến</span>}
              </button>
              <button type="button" className={`txd-section-tab ${activeSection==='otp'?'active':''}`} onClick={() => setActiveSection('otp')} disabled={!canOtp && !['COMPLETED','AUTOCOMPLETED'].includes(statusKey)}>
                OTP
              </button>
              <button className={`txd-section-tab ${activeSection==='review'?'active':''}`} onClick={() => setActiveSection('review')} disabled={!canReview && !hasReviewed}>
                Đánh giá
              </button>
            </div>

            {/* CHAT */}
            {activeSection === 'chat' && (
              <div className="txd-chat-section">
                <div className="txd-chat-header">
                  <div className="txd-chat-avatar">{otherUser?.username?.charAt(0)?.toUpperCase() || '?'}</div>
                  <div>
                    <div className="txd-chat-name">@{otherUser?.username}</div>
                    <div className="txd-chat-status-text">{canChat ? 'Đang trực tuyến' : 'Trò chuyện đã kết thúc'}</div>
                  </div>
                </div>
                <div className="txd-chat-messages" ref={chatContainerRef}>
                  {messages.length === 0 ? (
                    <div className="txd-chat-empty">
                      <p>Chưa có tin nhắn nào.</p>
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
                    <button type="submit" className="txd-chat-send" disabled={!newMessage.trim()}>Gửi</button>
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
                  <h3>Xác nhận giao dịch bằng OTP</h3>
                  <p>Khi hai bên đã gặp và giao sách tại điểm hẹn</p>
                </div>

                <div className="txd-otp-guide">
                  <div className="txd-otp-guide-title">Quy trình</div>
                  <ol className="txd-otp-steps">
                    <li>Người <strong>mua</strong> nhấn "Tạo mã OTP"</li>
                    <li>Mã 6 số hiện trên màn hình người <strong>mua</strong></li>
                    <li>Người <strong>mua</strong> đọc mã cho người <strong>bán</strong></li>
                    <li>Người <strong>bán</strong> nhập mã: giao dịch hoàn thành</li>
                  </ol>
                </div>

                <div className="txd-otp-status">
                  <div className={`txd-confirm-item ${transaction.buyerConfirmed ? 'confirmed' : ''}`}>
                    <span className="txd-confirm-icon">{transaction.buyerConfirmed ? 'Rồi' : 'Chưa'}</span>
                    <span>Người mua xác nhận</span>
                  </div>
                  <div className={`txd-confirm-item ${transaction.sellerConfirmed ? 'confirmed' : ''}`}>
                    <span className="txd-confirm-icon">{transaction.sellerConfirmed ? 'Rồi' : 'Chưa'}</span>
                    <span>Người bán xác nhận</span>
                  </div>
                </div>

                {canOtp && (
                  <div className="txd-otp-actions">
                    {/* BUYER: generates OTP */}
                    {role === 'buyer' && !otpGenerated && (
                      <button className="txd-btn txd-btn-otp" onClick={handleGenerateOtp}>
                        Tạo mã OTP
                      </button>
                    )}
                    {role === 'buyer' && otpGenerated && (
                      <div className="txd-otp-display">
                        <div className="txd-otp-label">Mã OTP của bạn — đọc cho người bán:</div>
                        <div className="txd-otp-code" style={{ letterSpacing: '0.3em', fontSize: '2.5rem' }}>{otpCode}</div>
                        <p className="txd-otp-hint">Mã có hiệu lực 30 phút · Không chia sẻ qua chat</p>
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
                        Xác nhận đã nhận hàng
                      </button>
                    )}
                  </div>
                )}

                {['COMPLETED','AUTOCOMPLETED'].includes(statusKey) && (
                  <div className="txd-otp-complete">
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
                            {star}
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
                    <button type="submit" className="txd-btn txd-btn-submit-review">Gửi đánh giá</button>
                  </form>
                ) : (
                  <div className="txd-review-locked">
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
