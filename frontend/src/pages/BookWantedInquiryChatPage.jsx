import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookWantedApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { getApiErrorMessage } from '../utils/apiError';
import './BookWantedPages.css';

const POLL_MS = 6000;

export default function BookWantedInquiryChatPage() {
  const { inquiryId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [inquiry, setInquiry] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const logEndRef = useRef(null);

  const fetchAll = useCallback(async (silent) => {
    if (!inquiryId) return;
    try {
      const [inqRes, msgRes] = await Promise.all([
        bookWantedApi.getInquiry(inquiryId),
        bookWantedApi.getInquiryMessages(inquiryId),
      ]);
      setInquiry(inqRes.data);
      setMessages(Array.isArray(msgRes.data) ? msgRes.data : []);
    } catch (err) {
      if (!silent) {
        toast.error(getApiErrorMessage(err, 'Không tải được cuộc trao đổi.'));
        setInquiry(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [inquiryId, toast]);

  useEffect(() => {
    setLoading(true);
    fetchAll(false);
  }, [fetchAll]);

  useEffect(() => {
    if (!inquiryId || loading) return undefined;
    const t = setInterval(() => fetchAll(true), POLL_MS);
    return () => clearInterval(t);
  }, [inquiryId, loading, fetchAll]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || !inquiryId) return;
    setSending(true);
    try {
      await bookWantedApi.sendInquiryMessage(inquiryId, { content });
      setText('');
      await fetchAll(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không gửi được tin nhắn.'));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="bw-page">
        <p className="bw-empty">Đang tải…</p>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="bw-page">
        <p className="bw-empty">Không tìm thấy cuộc trao đổi hoặc bạn không có quyền xem.</p>
        <Link to="/book-wanted" className="bw-btn bw-btn--primary" style={{ marginTop: 'var(--space-4)', display: 'inline-flex' }}>
          Về tìm sách
        </Link>
      </div>
    );
  }

  const myId = user?.id != null ? String(user.id) : '';
  const otherLabel =
    String(inquiry.requesterUserId) === myId
      ? inquiry.responderMaskedUsername || 'Người liên hệ'
      : inquiry.requesterMaskedUsername || 'Người đăng tin';

  return (
    <div className="bw-page">
      <div className="bw-breadcrumb">
        <Link to="/book-wanted">Tìm sách</Link>
        <span> / </span>
        <Link to={`/book-wanted/${inquiry.postId}`}>{inquiry.postTitle}</Link>
        <span> / </span>
        <span>Trao đổi</span>
      </div>

      <h1 className="bw-page__title">Liên hệ tìm sách</h1>
      <p className="bw-page__lead">
        Tin: <strong>{inquiry.postTitle}</strong>
        <br />
        Trao đổi với: <strong>{otherLabel}</strong>
      </p>

      <section className="bw-chat" aria-label="Tin nhắn">
        <div className="bw-chat__log" role="log" aria-live="polite">
          {messages.length === 0 ? (
            <p className="bw-empty" style={{ margin: 0 }}>Chưa có tin nhắn. Hãy chào và trao đổi về sách.</p>
          ) : (
            messages.map((m) => {
              const mine = String(m.senderId) === myId;
              return (
                <div key={m.id} className={`bw-chat__bubble ${mine ? 'bw-chat__bubble--mine' : ''}`}>
                  <span className="bw-chat__bubble-meta">{m.senderName || 'Ẩn danh'}</span>
                  {m.content}
                </div>
              );
            })
          )}
          <div ref={logEndRef} />
        </div>

        <form className="bw-chat__form" onSubmit={handleSubmit}>
          <label htmlFor="bw-inquiry-msg" className="sr-only">
            Nội dung tin nhắn
          </label>
          <textarea
            id="bw-inquiry-msg"
            className="bw-chat__input"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập tin nhắn…"
            maxLength={4000}
            disabled={sending}
            aria-label="Nội dung tin nhắn"
          />
          <button type="submit" className="bw-btn bw-btn--primary" disabled={sending || !text.trim()}>
            {sending ? 'Đang gửi…' : 'Gửi'}
          </button>
        </form>
      </section>
    </div>
  );
}

