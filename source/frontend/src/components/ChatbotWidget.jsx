import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { aiApi } from '../api/endpoints';
import { getApiErrorMessage } from '../utils/apiError';
import './ChatbotWidget.css';

/* ── Bot Avatar ── */
function BotAvatar() {
  return (
    <div className="cb-avatar cb-avatar--bot" aria-hidden="true">
      🎓
    </div>
  );
}

/* ── Typing indicator ── */
function TypingDots() {
  return (
    <div className="cb-msg cb-msg--bot">
      <BotAvatar />
      <div className="cb-bubble cb-bubble--bot cb-typing">
        <span /><span /><span />
      </div>
    </div>
  );
}

/* ── Quick question chips ── */
const QUICK_QUESTIONS = [
  'Quy trình mua sách thế nào?',
  'Mã OTP là gì?',
  'Làm sao để đăng bán?',
  'Tranh chấp giao dịch?',
  'Điểm uy tín là gì?',
];

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: 'Xin chào! 👋 Tôi là trợ lý AI của **EduCycle**.\n\nTôi có thể giúp bạn giải đáp mọi thắc mắc về mua bán tài liệu, quy trình giao dịch, OTP, uy tín người dùng và nhiều hơn nữa.\n\nBạn muốn hỏi gì? 😊',
};

/** Parse **bold** markdown thành <strong> */
function parseMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    // Convert \n to <br>
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>{line}{j < arr.length - 1 && <br />}</span>
    ));
  });
}

export default function ChatbotWidget() {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [hasNewMsg, setHasNewMsg] = useState(false);

  const messagesEndRef  = useRef(null);
  const inputRef        = useRef(null);
  const messageIdRef    = useRef(1);

  const nextId = () => String(messageIdRef.current++);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasNewMsg(false);
    }
  }, [open]);

  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để dùng chatbot AI 🎓');
      return;
    }

    setInput('');
    const userMsg = { id: nextId(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build history for API (exclude welcome message which has no role context)
      const history = [...messages.filter(m => m.id !== 'welcome'), userMsg]
        .map(m => ({ role: m.role, content: m.content }));

      const res = await aiApi.chat({ messages: history });
      const reply = res.data?.reply || 'Xin lỗi, không nhận được phản hồi.';

      const botMsg = { id: nextId(), role: 'assistant', content: reply };
      setMessages(prev => [...prev, botMsg]);

      // If widget is closed, show badge
      if (!open) setHasNewMsg(true);
    } catch (err) {
      const errMsg = getApiErrorMessage(err, 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.');
      setMessages(prev => [...prev, { id: nextId(), role: 'assistant', content: errMsg }]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, loading, messages, isAuthenticated, open]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClear = () => {
    setMessages([WELCOME_MESSAGE]);
    messageIdRef.current = 1;
  };

  return (
    <>
      {/* ── Floating button ── */}
      <button
        className={`cb-fab ${open ? 'cb-fab--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Đóng chatbot' : 'Mở chatbot AI'}
      >
        {open ? (
          <span className="cb-fab-icon">✕</span>
        ) : (
          <>
            <span className="cb-fab-icon">🤖</span>
            {hasNewMsg && <span className="cb-fab-badge" />}
          </>
        )}
        <span className="cb-fab-label">{open ? '' : 'Hỏi AI'}</span>
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div className="cb-panel" role="dialog" aria-label="EduCycle AI Chatbot">
          {/* Header */}
          <div className="cb-header">
            <div className="cb-header-left">
              <div className="cb-header-avatar">🎓</div>
              <div>
                <div className="cb-header-name">EduCycle AI</div>
                <div className="cb-header-status">
                  <span className="cb-status-dot" />
                  Trực tuyến
                </div>
              </div>
            </div>
            <div className="cb-header-actions">
              <button
                className="cb-header-btn"
                onClick={handleClear}
                title="Xóa lịch sử chat"
              >
                🗑️
              </button>
              <button
                className="cb-header-btn"
                onClick={() => setOpen(false)}
                title="Thu nhỏ"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="cb-messages">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`cb-msg ${msg.role === 'user' ? 'cb-msg--user' : 'cb-msg--bot'}`}
              >
                {msg.role === 'assistant' && <BotAvatar />}
                <div className={`cb-bubble ${msg.role === 'user' ? 'cb-bubble--user' : 'cb-bubble--bot'}`}>
                  {parseMarkdown(msg.content)}
                </div>
              </div>
            ))}

            {loading && <TypingDots />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions (only show if ≤1 non-welcome messages) */}
          {messages.filter(m => m.id !== 'welcome').length === 0 && !loading && (
            <div className="cb-quick">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  className="cb-quick-btn"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="cb-input-area">
            {!isAuthenticated ? (
              <div className="cb-login-prompt">
                🔐 <Link to="/auth">Đăng nhập</Link> để chat với AI
              </div>
            ) : (
              <div className="cb-input-row">
                <textarea
                  ref={inputRef}
                  className="cb-input"
                  placeholder="Nhập câu hỏi..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  maxLength={1000}
                  disabled={loading}
                />
                <button
                  className="cb-send-btn"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  aria-label="Gửi"
                >
                  {loading ? <span className="cb-send-spinner" /> : '➤'}
                </button>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="cb-footer">
            Powered by Claude AI · Chỉ về EduCycle
          </div>
        </div>
      )}
    </>
  );
}
