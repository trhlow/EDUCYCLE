import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import './AuthPage.css';

/* ── SVG brand icons (inline to avoid extra deps) ── */
function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.9 33.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.2-2.7-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.5 18.8 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.7-3.5-11.2-8.3l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.2-2.7-.4-3.9z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

/* ── OTP Verification Modal ── */
function OtpVerifyModal({ email, onVerified, onResend }) {
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { verifyOtp, resendOtp } = useAuth();
  const handleVerify = async () => {
    if (otp.length < 4) {
      toast.error('Vui lòng nhập mã OTP (6 số)');
      return;
    }
    setVerifying(true);
    try {
      await verifyOtp(email, otp);
      toast.success('Xác thực email thành công! 🎉');
      onVerified();
    } catch (err) {
      toast.error(err.message || 'Mã OTP không đúng!');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendOtp(email);
      toast.success('Đã gửi lại mã OTP!');
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error(err.message || 'Gửi lại thất bại');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-modal-overlay">
      <div className="otp-modal">
        <div className="otp-modal-icon">📧</div>
        <h3 className="otp-modal-title">Xác Thực Email</h3>
        <p className="otp-modal-desc">
          Chúng tôi đã gửi mã OTP 6 số đến <strong>{email}</strong>.
          Vui lòng kiểm tra hộp thư (và thư rác) để lấy mã.
        </p>

        <div className="otp-modal-form">
          <input
            type="text"
            className="otp-input"
            placeholder="Nhập mã OTP 6 số"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            autoFocus
          />
          <button
            className="otp-verify-btn"
            onClick={handleVerify}
            disabled={verifying || otp.length < 4}
          >
            {verifying ? '⏳ Đang xác thực...' : '✅ Xác Thực'}
          </button>
        </div>

        <div className="otp-resend">
          <span>Không nhận được mã? </span>
          <button
            className="otp-resend-btn"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
          >
            {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : 'Gửi lại mã'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpStep, setOtpStep] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const { login, register, verifyOtp, resendOtp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const validateLogin = () => {
    const newErrors = {};
    if (!loginForm.email || !loginForm.email.includes('@')) {
      newErrors.loginEmail = 'Vui lòng nhập email hợp lệ';
    }
    if (!loginForm.password) {
      newErrors.loginPassword = 'Mật khẩu là bắt buộc';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors = {};
    if (!registerForm.username || registerForm.username.length < 3) {
      newErrors.registerUsername = 'Tên người dùng phải có ít nhất 3 ký tự';
    }
    if (!registerForm.email || !registerForm.email.includes('@')) {
      newErrors.registerEmail = 'Vui lòng nhập email hợp lệ';
    }
    if (!registerForm.password || registerForm.password.length < 6) {
      newErrors.registerPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.registerConfirm = 'Mật khẩu xác nhận không khớp';
    }
    if (!registerForm.agreeTerms) {
      newErrors.registerTerms = 'Bạn phải đồng ý với điều khoản';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setIsSubmitting(true);
    try {
      const userData = await login(loginForm.email, loginForm.password);
      toast.success('Đăng nhập thành công!');
      const isAdminUser = userData?.role?.toUpperCase() === 'ADMIN';
      const from = location.state?.from?.pathname || (isAdminUser ? '/admin' : '/products');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Đăng nhập thất bại');
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setIsSubmitting(true);
    try {
      await register(registerForm.username, registerForm.email, registerForm.password);
      setPendingEmail(registerForm.email);
      setOtpStep(true);
      setOtpCode('');
      setErrors({});
      toast.success('Đăng ký thành công! Vui lòng nhập mã OTP đã gửi qua email.');
      setIsSubmitting(false);
    } catch (err) {
      toast.error(err.message || 'Đăng ký thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrors((prev) => ({ ...prev, registerOtp: 'Vui lòng nhập mã OTP hợp lệ' }));
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOtp(pendingEmail, otpCode);
      toast.success('Xác thực email thành công! Mời bạn đăng nhập.');
      setOtpStep(false);
      setActiveTab('login');
      setLoginForm((prev) => ({ ...prev, email: pendingEmail }));
      setOtpCode('');
      setPendingEmail('');
      setErrors({});
      setIsSubmitting(false);
    } catch (err) {
      toast.error(err.message || 'Xác thực OTP thất bại');
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingEmail) return;
    try {
      await resendOtp(pendingEmail);
      toast.success('Đã gửi lại OTP. Vui lòng kiểm tra email.');
    } catch (err) {
      toast.error(err.message || 'Không thể gửi lại OTP');
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrors({});
    if (tab !== 'register') {
      setOtpStep(false);
      setOtpCode('');
      setPendingEmail('');
    }
  };

  /* ── Shared social buttons component ── */
  const SocialLoginButtons = () => (
    <>
      <div className="auth-divider">hoặc tiếp tục với</div>
      <div className="auth-social-login">
        <button
          type="button"
          className="auth-social-btn auth-social-btn--microsoft"
          onClick={() => handleSocialLogin('Microsoft', loginWithMicrosoft)}
          disabled={isSubmitting}
        >
          <MicrosoftIcon />
          <span>Microsoft</span>
        </button>
        <button
          type="button"
          className="auth-social-btn auth-social-btn--google"
          onClick={() => handleSocialLogin('Google', loginWithGoogle)}
          disabled={isSubmitting}
        >
          <GoogleIcon />
          <span>Google</span>
        </button>
        <button
          type="button"
          className="auth-social-btn auth-social-btn--facebook"
          onClick={() => handleSocialLogin('Facebook', loginWithFacebook)}
          disabled={isSubmitting}
        >
          <FacebookIcon />
          <span>Facebook</span>
        </button>
      </div>
      <p className="auth-social-hint">
        💡 Sử dụng email trường (*.edu.vn) với Microsoft để xác thực sinh viên
      </p>
    </>
  );

  // If showing OTP modal after registration
  if (showOtpModal) {
    return (
      <div className="auth-page">
        <OtpVerifyModal
          email={pendingEmail}
          onVerified={() => {
            toast.success('Email đã xác thực! Chào mừng bạn đến EduCycle! 🎉');
            navigate('/products', { replace: true });
          }}
        />
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">🎓 EduCycle</div>
          <div className="auth-tagline">Sàn giao dịch tài liệu giáo dục chất lượng</div>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Đăng nhập
          </button>
          <button
            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => switchTab('register')}
          >
            Đăng ký
          </button>
        </div>

        <div className="auth-content">
          {activeTab === 'login' && (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="login-email">Email</label>
                <input
                  type="email"
                  id="login-email"
                  className={`auth-input ${errors.loginEmail ? 'error' : ''}`}
                  placeholder="your@email.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
                <div className={`auth-error ${errors.loginEmail ? 'show' : ''}`}>
                  {errors.loginEmail}
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="login-password">Mật khẩu</label>
                <input
                  type="password"
                  id="login-password"
                  className={`auth-input ${errors.loginPassword ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
                <div className={`auth-error ${errors.loginPassword ? 'show' : ''}`}>
                  {errors.loginPassword}
                </div>
              </div>

              <div className="auth-checkbox-group">
                <input type="checkbox" id="remember-me" />
                <label htmlFor="remember-me">Ghi nhớ tôi</label>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </button>

              <SocialLoginButtons />

              <div className="auth-footer">
                <a href="#">Quên mật khẩu?</a>
              </div>
            </form>
          )}

          {activeTab === 'register' && !otpStep && (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="register-username">Tên người dùng</label>
                <input
                  type="text"
                  id="register-username"
                  className={`auth-input ${errors.registerUsername ? 'error' : ''}`}
                  placeholder="johndoe"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                />
                <div className={`auth-error ${errors.registerUsername ? 'show' : ''}`}>
                  {errors.registerUsername}
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="register-email">Email</label>
                <input
                  type="email"
                  id="register-email"
                  className={`auth-input ${errors.registerEmail ? 'error' : ''}`}
                  placeholder="your@university.edu.vn"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
                <div className={`auth-error ${errors.registerEmail ? 'show' : ''}`}>
                  {errors.registerEmail}
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="register-password">Mật khẩu</label>
                <input
                  type="password"
                  id="register-password"
                  className={`auth-input ${errors.registerPassword ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
                <div className={`auth-error ${errors.registerPassword ? 'show' : ''}`}>
                  {errors.registerPassword}
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="register-confirm">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  id="register-confirm"
                  className={`auth-input ${errors.registerConfirm ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                />
                <div className={`auth-error ${errors.registerConfirm ? 'show' : ''}`}>
                  {errors.registerConfirm}
                </div>
              </div>

              <div className="auth-checkbox-group">
                <input
                  type="checkbox"
                  id="terms"
                  checked={registerForm.agreeTerms}
                  onChange={(e) => setRegisterForm({ ...registerForm, agreeTerms: e.target.checked })}
                />
                <label htmlFor="terms">Tôi đồng ý với Điều khoản & Điều kiện</label>
              </div>
              <div className={`auth-error ${errors.registerTerms ? 'show' : ''}`} style={{ marginTop: '-1rem', marginBottom: '1rem' }}>
                {errors.registerTerms}
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}
              </button>

              <SocialLoginButtons />

              <div className="auth-footer" style={{ marginTop: 'var(--space-6)' }}>
                Đã có tài khoản?{' '}
                <button type="button" onClick={() => switchTab('login')}>
                  Đăng nhập
                </button>
              </div>
            </form>
          )}

          {activeTab === 'register' && otpStep && (
            <form className="auth-form" onSubmit={handleVerifyOtpSubmit}>
              <div className="auth-form-group">
                <label className="auth-label">Xác thực email</label>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Mã OTP đã được gửi đến <strong>{pendingEmail}</strong>.
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="register-otp">Mã OTP</label>
                <input
                  type="text"
                  id="register-otp"
                  className={`auth-input ${errors.registerOtp ? 'error' : ''}`}
                  placeholder="Nhập mã OTP..."
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
                <div className={`auth-error ${errors.registerOtp ? 'show' : ''}`}>
                  {errors.registerOtp}
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Đang xác thực...' : 'Xác thực OTP'}
              </button>

              <div className="auth-footer" style={{ marginTop: 'var(--space-6)' }}>
                <button type="button" onClick={handleResendOtp}>
                  Gửi lại OTP
                </button>
                {' · '}
                <button type="button" onClick={() => setOtpStep(false)}>
                  Đổi thông tin đăng ký
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
