import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import './AuthPage.css';

/* ── SVG brand icons (inline to avoid extra deps) ── */
const MicrosoftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#1877F2" d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4z" />
    <path fill="#fff" d="M26.572 25.75h4.082l.643-4.144h-4.725v-2.346c0-1.715.56-3.234 2.164-3.234h2.607V12.5c-.458-.063-1.429-.196-3.256-.196-3.814 0-6.04 2.009-6.04 6.591v2.711H18v4.144h4.047V38.5h4.525V25.75z" />
  </svg>
);

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, register, loginWithMicrosoft, loginWithGoogle, loginWithFacebook } = useAuth();
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
      newErrors.registerConfirm = 'Mật khẩu không khớp';
    }
    if (!registerForm.agreeTerms) {
      newErrors.registerTerms = 'Bạn phải đồng ý với Điều khoản & Điều kiện';
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
      const isAdminUser = userData?.role === 'Admin';
      const from = location.state?.from?.pathname || (isAdminUser ? '/dashboard' : '/products');
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
      toast.success('Đăng ký thành công! Chào mừng bạn!');
      navigate('/products', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Đăng ký thất bại');
      setIsSubmitting(false);
    }
  };

  /* ── Social login handlers ── */
  const handleSocialLogin = async (provider, loginFn) => {
    setIsSubmitting(true);
    try {
      const userData = await loginFn();
      toast.success(`Đăng nhập bằng ${provider} thành công!`);
      const from = location.state?.from?.pathname || '/products';
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || `Đăng nhập bằng ${provider} thất bại`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrors({});
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

          {activeTab === 'register' && (
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
        </div>
      </div>
    </div>
  );
}
