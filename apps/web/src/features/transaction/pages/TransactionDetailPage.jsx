import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/Toast';
import { transactionsApi, reviewsApi } from '../api';
import { maskUsername } from '../../../lib/mask-username';
import { createChatClient, sendChatMessage } from '../../../lib/websocket';
import OtpCodeInput from '../../../components/inputs/OtpCodeInput';
import { queryKeys } from '../../../lib/query-keys';
import { useTransaction } from '../hooks/useTransaction';
import { useTransactionMessages, upsertMessage } from '../hooks/useTransactionMessages';
import { useSendTransactionMessage } from '../hooks/useSendTransactionMessage';
import { useGenerateTransactionOtp, useVerifyTransactionOtp } from '../hooks/useTransactionOtp';
import TransactionTimeline from '../components/TransactionTimeline';
import { PageHeader, StatusBadge } from '../../../components/ui';
import './TransactionDetailPage.css';

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ xác nhận', color: 'warning', step: 1 },
  ACCEPTED: { label: 'Đã chấp nhận', color: 'info', step: 3 },
  MEETING: { label: 'Đang gặp mặt', color: 'primary', step: 3 },
  COMPLETED: { label: 'Hoàn thành', color: 'success', step: 4 },
  AUTOCOMPLETED: { label: 'Tự động hoàn thành', color: 'success', step: 4 },
  AUTO_COMPLETED: { label: 'Tự động hoàn thành', color: 'success', step: 4 },
  REJECTED: { label: 'Từ chối', color: 'error', step: -1 },
  CANCELLED: { label: 'Đã hủy', color: 'neutral', step: -1 },
  DISPUTED: { label: 'Tranh chấp', color: 'error', step: -1 },
};

const STEPS = [
  { step: 1, label: 'Gửi yêu cầu' },
  { step: 2, label: 'Chấp nhận' },
  { step: 3, label: 'OTP và hoàn tất' },
  { step: 4, label: 'Hoàn thành' },
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
    toast.error(typeof msg === 'string' ? msg : 'Không tải được giao dịch.');
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
      toast.success(newStatus === 'ACCEPTED' ? 'Đã chấp nhận yêu cầu mua.' : 'Cập nhật thành công.');
      await refetchTransaction();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Không cập nhật được trạng thái.');
    }
  };

  const handleCancelTransaction = async () => {
    if (!window.confirm('Hủy giao dịch này?')) return;
    setCancelSubmitting(true);
    try {
      const body = cancelReasonInput.trim() ? { reason: cancelReasonInput.trim() } : {};
      await transactionsApi.cancel(id, body);
      toast.success('Đã hủy giao dịch.');
      setCancelReasonInput('');
      await refetchTransaction();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Không hủy được giao dịch.');
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
        toast.error('Gửi tin nhắn thất bại. Vui lòng thử lại.');
      }
    },
    [newMessage, id, queryClient, sendMessageMutation, toast, user?.id, user?.username],
  );

  const handleGenerateOtp = async () => {
    try {
      const otp = await generateOtpMutation.mutateAsync();
      setOtpCode(otp || '------');
      setOtpGenerated(true);
      toast.success('OTP đã được tạo. Đọc mã cho người bán.');
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Không tạo được OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length < 4) {
      toast.error('Vui lòng nhập OTP hợp lệ.');
      return;
    }
    try {
      await verifyOtpMutation.mutateAsync({ otp: otpInput });
      toast.success('Xác nhận OTP thành công.');
      setOtpInput('');
      await refetchTransaction();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Mã OTP không đúng hoặc đã hết hạn.');
    }
  };

  const handleConfirmReceipt = async () => {
    try {
      await transactionsApi.confirmReceipt(id);
      toast.success('Đã xác nhận nhận hàng.');
      await refetchTransaction();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Không xác nhận được.');
    }
  };

  const handleOpenDispute = async () => {
    if (!window.confirm('Báo tranh chấp cho admin?')) return;
    setDisputeSubmitting(true);
    try {
      const body = disputeReasonInput.trim() ? { reason: disputeReasonInput.trim() } : {};
      await transactionsApi.openDispute(id, body);
      toast.success('Đã gửi báo tranh chấp.');
      setDisputeReasonInput('');
      await refetchTransaction();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Không gửi được tranh chấp.');
    } finally {
      setDisputeSubmitting(false);
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!reviewForm.comment.trim()) {
      toast.error('Vui lòng nhập nhận xét.');
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
      toast.success('Đã gửi đánh giá.');
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error;
      toast.error(typeof msg === 'string' ? msg : 'Gửi đánh giá thất bại.');
    }
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
        <div className="txd-container txd-empty-state">
          <h2>Không tìm thấy giao dịch</h2>
          <div className="txd-empty-actions">
            <button type="button" className="txd-btn txd-btn-meeting" onClick={() => void transactionQuery.refetch()}>
              Thử tải lại
            </button>
            <Link to="/transactions">Quay lại danh sách</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="txd-page">
      <div className="txd-container">
        <PageHeader
          eyebrow={`Phiên giao dịch #${transaction.id}`}
          title="Chi tiết giao dịch"
          subtitle={`Đối tác: @${maskUsername(otherUser?.username)} • Cập nhật lần cuối ${formatDate(transaction.updatedAt)}`}
          actions={<Link to="/transactions">Quay lại danh sách</Link>}
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
              <h3 className="txd-info-title">Thông tin giao dịch</h3>
                <div className="txd-info-grid">
                <div className="txd-info-row"><span className="txd-info-label">Mã giao dịch</span><span className="txd-info-value">#{transaction.id}</span></div>
                <div className="txd-info-row"><span className="txd-info-label">Trạng thái</span><StatusBadge status={statusKey} label={config.label} /></div>
                <div className="txd-info-row"><span className="txd-info-label">Vai trò của bạn</span><span className={`tx-role-badge tx-role-${role}`}>{role === 'buyer' ? 'Người mua' : 'Người bán'}</span></div>
                <div className="txd-info-row"><span className="txd-info-label">Đối tác</span><span className="txd-info-value">@{maskUsername(otherUser?.username)}</span></div>
                <div className="txd-info-row"><span className="txd-info-label">Tạo lúc</span><span className="txd-info-value">{formatDate(transaction.createdAt)}</span></div>
                <div className="txd-info-row"><span className="txd-info-label">Cập nhật</span><span className="txd-info-value">{formatDate(transaction.updatedAt)}</span></div>
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

              {canCancelAccepted && (
                <div className="txd-actions-group">
                  <textarea
                    className="auth-input txd-action-textarea"
                    placeholder="Lý do hủy (tùy chọn)..."
                    value={cancelReasonInput}
                    onChange={(event) => setCancelReasonInput(event.target.value)}
                    maxLength={2000}
                    aria-label="Lý do hủy giao dịch"
                  />
                  <button type="button" className="txd-btn txd-btn-cancel" disabled={cancelSubmitting} onClick={handleCancelTransaction}>
                    {cancelSubmitting ? 'Đang xử lý...' : 'Hủy giao dịch'}
                  </button>
                </div>
              )}

              {canDispute && (
                <div className="txd-actions-group txd-actions-group--dispute">
                  <textarea
                    className="auth-input txd-action-textarea"
                    placeholder="Mô tả ngắn (không bắt buộc)..."
                    value={disputeReasonInput}
                    onChange={(event) => setDisputeReasonInput(event.target.value)}
                    maxLength={2000}
                  />
                  <button type="button" className="txd-btn txd-btn-cancel" disabled={disputeSubmitting} onClick={handleOpenDispute}>
                    {disputeSubmitting ? 'Đang gửi...' : 'Báo tranh chấp'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="txd-right">
            <div className="txd-section-tabs">
              <button className={`txd-section-tab ${activeSection === 'chat' ? 'active' : ''}`} onClick={() => setActiveSection('chat')}>
                Chat {canChat && <span className="txd-tab-live">trực tuyến</span>}
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
                    <div className="txd-chat-status-text">{wsConnected ? 'WebSocket đang kết nối' : 'Đang fallback HTTP polling'}</div>
                  </div>
                  {!wsConnected && (
                    <button type="button" className="txd-chat-retry" onClick={() => setWsEpoch((x) => x + 1)}>
                      Thử kết nối lại
                    </button>
                  )}
                </div>

                <div className="txd-chat-messages" aria-live="polite">
                  {messages.length === 0 ? (
                    <div className="txd-chat-empty">
                      <p>Chưa có tin nhắn nào.</p>
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
                      placeholder="Nhập tin nhắn..."
                      value={newMessage}
                      onChange={(event) => setNewMessage(event.target.value)}
                    />
                    <button type="submit" className="txd-chat-send" disabled={!newMessage.trim() || sendMessageMutation.isPending}>
                      {sendMessageMutation.isPending ? 'Đang gửi...' : 'Gửi'}
                    </button>
                  </form>
                ) : (
                  <div className="txd-chat-disabled">
                    Chat sẽ mở khi giao dịch được chấp nhận.
                  </div>
                )}
              </div>
            )}

            {activeSection === 'otp' && (
              <div className="txd-otp-section">
                <div className="txd-otp-header">
                  <h3>Xác nhận giao dịch bằng OTP</h3>
                  <p>Khi hai bên đã gặp và giao sách tại điểm hẹn.</p>
                </div>

                {canOtp && (
                  <div className="txd-otp-actions">
                    {role === 'buyer' && !otpGenerated && (
                      <button className="txd-btn txd-btn-otp" onClick={handleGenerateOtp} disabled={generateOtpMutation.isPending}>
                        {generateOtpMutation.isPending ? 'Đang tạo...' : 'Tạo mã OTP'}
                      </button>
                    )}

                    {role === 'buyer' && otpGenerated && (
                      <div className="txd-otp-display" aria-live="polite">
                        <div className="txd-otp-label">OTP của bạn - đọc cho người bán:</div>
                        <div className="txd-otp-code">{otpCode}</div>
                        <p className="txd-otp-hint">Mã có hiệu lực 30 phút. Không chia sẻ trong chat.</p>
                      </div>
                    )}

                    {role === 'seller' && (
                      <div className="txd-otp-verify">
                        <label className="txd-otp-label">Nhập OTP từ người mua:</label>
                        <div className="txd-otp-input-group txd-otp-input-group--slots">
                          <OtpCodeInput
                            value={otpInput}
                            onChange={setOtpInput}
                            autoFocus
                            ariaLabel="Nhập mã OTP"
                          />
                          <button className="txd-btn txd-btn-verify" onClick={handleVerifyOtp} disabled={verifyOtpMutation.isPending}>
                            {verifyOtpMutation.isPending ? 'Đang xác nhận...' : 'Xác nhận'}
                          </button>
                        </div>
                      </div>
                    )}

                    {role === 'buyer' && !transaction.buyerConfirmed && (
                      <button className="txd-btn txd-btn-confirm" onClick={handleConfirmReceipt}>
                        Xác nhận đã nhận hàng
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
                    <h3>Cảm ơn bạn đã đánh giá.</h3>
                  </div>
                ) : canReview ? (
                  <form className="txd-review-form" onSubmit={handleSubmitReview}>
                    <h3 className="txd-review-title">Đánh giá @{otherUser?.username}</h3>
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
                            {star}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="txd-review-comment">
                      <label>Nhận xét:</label>
                      <textarea
                        className="txd-review-textarea"
                        rows={4}
                        placeholder="Chia sẻ trải nghiệm giao dịch..."
                        value={reviewForm.comment}
                        onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })}
                      />
                    </div>
                    <button type="submit" className="txd-btn txd-btn-submit-review">Gửi đánh giá</button>
                  </form>
                ) : (
                  <div className="txd-review-locked">
                    <p>Đánh giá chỉ có sau khi giao dịch hoàn thành.</p>
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



