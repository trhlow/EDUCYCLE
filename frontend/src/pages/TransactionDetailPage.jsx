import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { transactionsApi, reviewsApi } from '../api/endpoints';
import { maskUsername } from '../utils/maskUsername';
import { createChatClient, sendChatMessage } from '../api/websocket';
import OtpCodeInput from '../components/inputs/OtpCodeInput';
import { queryKeys } from '../lib/query/queryKeys';
import { useTransaction } from '../features/transactions/hooks/useTransaction';
import { useTransactionMessages, upsertMessage } from '../features/transactions/hooks/useTransactionMessages';
import { useSendTransactionMessage } from '../features/transactions/hooks/useSendTransactionMessage';
import { useGenerateTransactionOtp, useVerifyTransactionOtp } from '../features/transactions/hooks/useTransactionOtp';
import TransactionTimeline from '../components/transactions/TransactionTimeline';
import { PageHeader, StatusBadge } from '../components/ui';
import './TransactionDetailPage.css';

const STATUS_CONFIG = {
  PENDING: { label: 'Cho xac nhan', color: 'warning', step: 1 },
  ACCEPTED: { label: 'Da chap nhan', color: 'info', step: 3 },
  MEETING: { label: 'Dang gap mat', color: 'primary', step: 3 },
  COMPLETED: { label: 'Hoan thanh', color: 'success', step: 4 },
  AUTOCOMPLETED: { label: 'Tu dong hoan thanh', color: 'success', step: 4 },
  REJECTED: { label: 'Tu choi', color: 'error', step: -1 },
  CANCELLED: { label: 'Da huy', color: 'neutral', step: -1 },
  DISPUTED: { label: 'Tranh chap', color: 'error', step: -1 },
};

const STEPS = [
  { step: 1, label: 'Gui yeu cau' },
  { step: 2, label: 'Chap nhan' },
  { step: 3, label: 'OTP va hoan tat' },
  { step: 4, label: 'Hoan thanh' },
];

const formatDate = (value) =>
  new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatTime = (value) =>
  new Date(value).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price ?? 0);

export default function TransactionDetailPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [newMessage, setNewMessage] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [hasReviewed, setHasReviewed] = useState(false);
  const [activeSection, setActiveSection] = useState('chat');
  const [disputeReasonInput, setDisputeReasonInput] = useState('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  const chatEndRef = useRef(null);
  const stompClientRef = useRef(null);

  const transactionQuery = useTransaction(id);
  const transaction = transactionQuery.data ?? null;
  const loading = transactionQuery.isPending;

  const statusKey = transaction?.status?.toUpperCase() || 'PENDING';
  const canChat = ['ACCEPTED', 'MEETING'].includes(statusKey);
  const canOtp = ['ACCEPTED', 'MEETING'].includes(statusKey);

  const messagesQuery = useTransactionMessages(id, {
    enabled: activeSection === 'chat' && Boolean(transaction),
    refetchInterval: canChat && !wsConnected ? 8000 : false,
  });
  const messages = useMemo(() => messagesQuery.data ?? [], [messagesQuery.data]);

  const sendMessageMutation = useSendTransactionMessage(id);
  const generateOtpMutation = useGenerateTransactionOtp(id);
  const verifyOtpMutation = useVerifyTransactionOtp(id);

  const role =
    String(transaction?.buyer?.id ?? '') === String(user?.id ?? '')
      ? 'buyer'
      : String(transaction?.seller?.id ?? '') === String(user?.id ?? '')
        ? 'seller'
        : 'unknown';

  const otherUser = role === 'buyer' ? transaction?.seller : transaction?.buyer;
  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;

  const isTerminal = ['COMPLETED', 'AUTOCOMPLETED', 'REJECTED', 'CANCELLED', 'DISPUTED'].includes(statusKey);
  const canReview = ['COMPLETED', 'AUTOCOMPLETED'].includes(statusKey) && !hasReviewed;
  const canDispute = role === 'buyer' && ['ACCEPTED', 'MEETING'].includes(statusKey);
  const canCancelAccepted = ['ACCEPTED', 'MEETING'].includes(statusKey) && !isTerminal;

  useEffect(() => {
    if (!transactionQuery.error) return;
    const msg =
      transactionQuery.error?.response?.data?.message ||
      transactionQuery.error?.response?.data?.error;
    toast.error(typeof msg === 'string' ? msg : 'Khong tai duoc giao dich.');
  }, [transactionQuery.error, toast]);

  const [wsEpoch, setWsEpoch] = useState(0);
  useEffect(() => {
    const bump = () => setWsEpoch((n) => n + 1);
    window.addEventListener('educycle:token-refreshed', bump);
    return () => window.removeEventListener('educycle:token-refreshed', bump);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !id) return;

    const client = createChatClient(
      token,
      id,
      (incoming) => {
        queryClient.setQueryData(queryKeys.transactions.messages(id), (prev) =>
          upsertMessage(prev, incoming),
        );
      },
      {
        onConnect: () => setWsConnected(true),
        onDisconnect: () => setWsConnected(false),
        onError: () => setWsConnected(false),
      },
    );

    client.activate();
    stompClientRef.current = client;

    return () => {
      setWsConnected(false);
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [id, wsEpoch, queryClient]);

  useEffect(() => {
    if (transaction?.status?.toUpperCase() === 'MEETING') {
      setActiveSection('otp');
    }
  }, [transaction?.status]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const refetchTransaction = useCallback(async () => {
    await transactionQuery.refetch();
  }, [transactionQuery]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await transactionsApi.updateStatus(id, { status: newStatus });
      toast.success(newStatus === 'ACCEPTED' ? 'Da chap nhan yeu cau mua.' : 'Cap nhat thanh cong.');
      await refetchTransaction();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Khong cap nhat duoc trang thai.');
    }
  };

  const handleCancelTransaction = async () => {
    if (!window.confirm('Huy giao dich nay?')) return;
    setCancelSubmitting(true);
    try {
      const body = cancelReasonInput.trim() ? { reason: cancelReasonInput.trim() } : {};
      await transactionsApi.cancel(id, body);
      toast.success('Da huy giao dich.');
      setCancelReasonInput('');
      await refetchTransaction();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Khong huy duoc giao dich.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleSendMessage = useCallback(
    async (event) => {
      event.preventDefault();
      const content = newMessage.trim();
      if (!content) return;

      setNewMessage('');

      if (stompClientRef.current?.connected) {
        sendChatMessage(stompClientRef.current, id, content);
        queryClient.setQueryData(queryKeys.transactions.messages(id), (prev) =>
          upsertMessage(prev, {
            id: `local-${Date.now()}`,
            senderId: user?.id,
            senderName: user?.username,
            content,
            createdAt: new Date().toISOString(),
          }),
        );
        return;
      }

      try {
        await sendMessageMutation.mutateAsync({
          content,
          senderId: user?.id,
          senderName: user?.username,
        });
      } catch {
        toast.error('Gui tin nhan that bai. Vui long thu lai.');
      }
    },
    [newMessage, id, queryClient, sendMessageMutation, toast, user?.id, user?.username],
  );

  const handleGenerateOtp = async () => {
    try {
      const otp = await generateOtpMutation.mutateAsync();
      setOtpCode(otp || '------');
      setOtpGenerated(true);
      toast.success('OTP da duoc tao. Doc ma cho nguoi ban.');
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Khong tao duoc OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length < 4) {
      toast.error('Vui long nhap OTP hop le.');
      return;
    }
    try {
      await verifyOtpMutation.mutateAsync({ otp: otpInput });
      toast.success('Xac nhan OTP thanh cong.');
      setOtpInput('');
      await refetchTransaction();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Ma OTP khong dung hoac da het han.');
    }
  };

  const handleConfirmReceipt = async () => {
    try {
      await transactionsApi.confirmReceipt(id);
      toast.success('Da xac nhan nhan hang.');
      await refetchTransaction();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Khong xac nhan duoc.');
    }
  };

  const handleOpenDispute = async () => {
    if (!window.confirm('Bao tranh chap cho admin?')) return;
    setDisputeSubmitting(true);
    try {
      const body = disputeReasonInput.trim() ? { reason: disputeReasonInput.trim() } : {};
      await transactionsApi.openDispute(id, body);
      toast.success('Da gui bao tranh chap.');
      setDisputeReasonInput('');
      await refetchTransaction();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Khong gui duoc tranh chap.');
    } finally {
      setDisputeSubmitting(false);
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!reviewForm.comment.trim()) {
      toast.error('Vui long nhap nhan xet.');
      return;
    }

    const targetUserId = otherUser?.id;
    try {
      await reviewsApi.create({
        targetUserId,
        transactionId: id,
        rating: reviewForm.rating,
        content: reviewForm.comment,
      });
      setHasReviewed(true);
      toast.success('Da gui danh gia.');
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Gui danh gia that bai.');
    }
  };

  if (loading) {
    return (
      <div className="txd-page">
        <div className="txd-container">
          <div className="txd-loading">
            <div className="loading-spinner" />
            <p>Dang tai giao dich...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="txd-page">
        <div className="txd-container" style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>Khong tim thay giao dich</h2>
          <div style={{ display: 'inline-flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="txd-btn txd-btn-meeting" onClick={() => void transactionQuery.refetch()}>
              Thu tai lai
            </button>
            <Link to="/transactions">Quay lai danh sach</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="txd-page">
      <div className="txd-container">
        <PageHeader
          eyebrow={`Phien giao dich #${transaction.id}`}
          title="Chi tiet giao dich"
          subtitle={`Doi tac: @${maskUsername(otherUser?.username)} • Cap nhat lan cuoi ${formatDate(transaction.updatedAt)}`}
          actions={<Link to="/transactions">Quay lai danh sach</Link>}
        />

        <TransactionTimeline steps={STEPS} currentStep={config.step} failed={config.step < 0} />

        <div className="txd-layout">
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
              <h3 className="txd-info-title">Thong tin giao dich</h3>
                <div className="txd-info-grid">
                <div className="txd-info-row"><span className="txd-info-label">Ma giao dich</span><span className="txd-info-value">#{transaction.id}</span></div>
                <div className="txd-info-row"><span className="txd-info-label">Trang thai</span><StatusBadge status={statusKey} label={config.label} /></div>
                <div className="txd-info-row"><span className="txd-info-label">Vai tro cua ban</span><span className={`tx-role-badge tx-role-${role}`}>{role === 'buyer' ? 'Nguoi mua' : 'Nguoi ban'}</span></div>
                <div className="txd-info-row"><span className="txd-info-label">Doi tac</span><span className="txd-info-value">@{maskUsername(otherUser?.username)}</span></div>
                <div className="txd-info-row"><span className="txd-info-label">Tao luc</span><span className="txd-info-value">{formatDate(transaction.createdAt)}</span></div>
                <div className="txd-info-row"><span className="txd-info-label">Cap nhat</span><span className="txd-info-value">{formatDate(transaction.updatedAt)}</span></div>
              </div>
            </div>

            <div className="txd-actions-card">
              {role === 'seller' && statusKey === 'PENDING' && (
                <div className="txd-actions-group">
                  <p className="txd-actions-hint">Ban co yeu cau mua moi tu @{maskUsername(transaction.buyer?.username)}</p>
                  <div className="txd-actions-btns">
                    <button className="txd-btn txd-btn-accept" onClick={() => handleStatusUpdate('ACCEPTED')}>Chap nhan</button>
                    <button className="txd-btn txd-btn-reject" onClick={() => handleStatusUpdate('REJECTED')}>Tu choi</button>
                  </div>
                </div>
              )}

              {canCancelAccepted && (
                <div className="txd-actions-group">
                  <textarea
                    className="auth-input"
                    style={{ width: '100%', minHeight: 72, marginBottom: 'var(--space-2)', resize: 'vertical' }}
                    placeholder="Ly do huy (tuy chon)..."
                    value={cancelReasonInput}
                    onChange={(event) => setCancelReasonInput(event.target.value)}
                    maxLength={2000}
                    aria-label="Ly do huy giao dich"
                  />
                  <button type="button" className="txd-btn txd-btn-cancel" disabled={cancelSubmitting} onClick={handleCancelTransaction}>
                    {cancelSubmitting ? 'Dang xu ly...' : 'Huy giao dich'}
                  </button>
                </div>
              )}

              {canDispute && (
                <div className="txd-actions-group" style={{ border: '1px solid var(--error-light, #ffcdd2)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
                  <textarea
                    className="auth-input"
                    style={{ width: '100%', minHeight: 72, marginBottom: 'var(--space-2)', resize: 'vertical' }}
                    placeholder="Mo ta ngan (khong bat buoc)..."
                    value={disputeReasonInput}
                    onChange={(event) => setDisputeReasonInput(event.target.value)}
                    maxLength={2000}
                  />
                  <button type="button" className="txd-btn txd-btn-cancel" disabled={disputeSubmitting} onClick={handleOpenDispute}>
                    {disputeSubmitting ? 'Dang gui...' : 'Bao tranh chap'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="txd-right">
            <div className="txd-section-tabs">
              <button className={`txd-section-tab ${activeSection === 'chat' ? 'active' : ''}`} onClick={() => setActiveSection('chat')}>
                Chat {canChat && <span className="txd-tab-live">truc tuyen</span>}
              </button>
              <button type="button" className={`txd-section-tab ${activeSection === 'otp' ? 'active' : ''}`} onClick={() => setActiveSection('otp')} disabled={!canOtp && !['COMPLETED', 'AUTOCOMPLETED'].includes(statusKey)}>
                OTP
              </button>
              <button className={`txd-section-tab ${activeSection === 'review' ? 'active' : ''}`} onClick={() => setActiveSection('review')} disabled={!canReview && !hasReviewed}>
                Danh gia
              </button>
            </div>

            {activeSection === 'chat' && (
              <div className="txd-chat-section">
                <div className="txd-chat-header">
                  <div className="txd-chat-avatar">{otherUser?.username?.charAt(0)?.toUpperCase() || '?'}</div>
                  <div>
                    <div className="txd-chat-name">@{otherUser?.username}</div>
                    <div className="txd-chat-status-text">{wsConnected ? 'WebSocket dang ket noi' : 'Dang fallback HTTP polling'}</div>
                  </div>
                  {!wsConnected && (
                    <button type="button" className="txd-chat-retry" onClick={() => setWsEpoch((x) => x + 1)}>
                      Thu ket noi lai
                    </button>
                  )}
                </div>

                <div className="txd-chat-messages" aria-live="polite">
                  {messages.length === 0 ? (
                    <div className="txd-chat-empty">
                      <p>Chua co tin nhan nao.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = String(msg.senderId ?? '') === String(user?.id ?? '');
                      return (
                        <div key={msg.id} className={`txd-msg ${isMe ? 'txd-msg-me' : 'txd-msg-other'}`}>
                          {!isMe && <div className="txd-msg-avatar">{msg.senderName?.charAt(0)?.toUpperCase() || '?'}</div>}
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
                      placeholder="Nhap tin nhan..."
                      value={newMessage}
                      onChange={(event) => setNewMessage(event.target.value)}
                    />
                    <button type="submit" className="txd-chat-send" disabled={!newMessage.trim() || sendMessageMutation.isPending}>
                      {sendMessageMutation.isPending ? 'Dang gui...' : 'Gui'}
                    </button>
                  </form>
                ) : (
                  <div className="txd-chat-disabled">
                    Chat se mo khi giao dich duoc chap nhan.
                  </div>
                )}
              </div>
            )}

            {activeSection === 'otp' && (
              <div className="txd-otp-section">
                <div className="txd-otp-header">
                  <h3>Xac nhan giao dich bang OTP</h3>
                  <p>Khi hai ben da gap va giao sach tai diem hen.</p>
                </div>

                {canOtp && (
                  <div className="txd-otp-actions">
                    {role === 'buyer' && !otpGenerated && (
                      <button className="txd-btn txd-btn-otp" onClick={handleGenerateOtp} disabled={generateOtpMutation.isPending}>
                        {generateOtpMutation.isPending ? 'Dang tao...' : 'Tao ma OTP'}
                      </button>
                    )}

                    {role === 'buyer' && otpGenerated && (
                      <div className="txd-otp-display" aria-live="polite">
                        <div className="txd-otp-label">OTP cua ban - doc cho nguoi ban:</div>
                        <div className="txd-otp-code">{otpCode}</div>
                        <p className="txd-otp-hint">Ma co hieu luc 30 phut. Khong chia se trong chat.</p>
                      </div>
                    )}

                    {role === 'seller' && (
                      <div className="txd-otp-verify">
                        <label className="txd-otp-label">Nhap OTP tu nguoi mua:</label>
                        <div className="txd-otp-input-group txd-otp-input-group--slots">
                          <OtpCodeInput
                            value={otpInput}
                            onChange={setOtpInput}
                            autoFocus
                            ariaLabel="Nhap ma OTP"
                          />
                          <button className="txd-btn txd-btn-verify" onClick={handleVerifyOtp} disabled={verifyOtpMutation.isPending}>
                            {verifyOtpMutation.isPending ? 'Dang xac nhan...' : 'Xac nhan'}
                          </button>
                        </div>
                      </div>
                    )}

                    {role === 'buyer' && !transaction.buyerConfirmed && (
                      <button className="txd-btn txd-btn-confirm" onClick={handleConfirmReceipt}>
                        Xac nhan da nhan hang
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'review' && (
              <div className="txd-review-section">
                {hasReviewed ? (
                  <div className="txd-review-done">
                    <h3>Cam on ban da danh gia.</h3>
                  </div>
                ) : canReview ? (
                  <form className="txd-review-form" onSubmit={handleSubmitReview}>
                    <h3 className="txd-review-title">Danh gia @{otherUser?.username}</h3>
                    <div className="txd-stars-input">
                      <label>So sao:</label>
                      <div className="txd-stars-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`txd-star-btn ${reviewForm.rating >= star ? 'active' : ''}`}
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          >
                            {star}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="txd-review-comment">
                      <label>Nhan xet:</label>
                      <textarea
                        className="txd-review-textarea"
                        rows={4}
                        placeholder="Chia se trai nghiem giao dich..."
                        value={reviewForm.comment}
                        onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })}
                      />
                    </div>
                    <button type="submit" className="txd-btn txd-btn-submit-review">Gui danh gia</button>
                  </form>
                ) : (
                  <div className="txd-review-locked">
                    <p>Danh gia chi co sau khi giao dich hoan thanh.</p>
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


