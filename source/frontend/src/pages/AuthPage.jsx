import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import './AuthPage.css';

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

              <div className="auth-divider">hoặc tiếp tục với</div>

              <div className="auth-social-login">
                <button type="button" className="auth-social-btn">Google</button>
                <button type="button" className="auth-social-btn">Facebook</button>
              </div>

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
                  placeholder="your@email.com"
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
