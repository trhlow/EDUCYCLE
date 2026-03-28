import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { authApi } from '../api/endpoints';
import EduCycleLogo from '../components/branding/EduCycleLogo';
import './AuthPage.css';

/* ── Validate .edu.vn email ───────────────────────────────── */
function isStudentEmail(email) {
  return typeof email === 'string' && email.toLowerCase().endsWith('.edu.vn');
}

const VIEW = {
  LOGIN:        'login',
  REGISTER:     'register',
  OTP:          'otp',
  FORGOT:       'forgot',
  FORGOT_SENT:  'forgot_sent',
  FORGOT_RESET: 'forgot_reset',
};

export default function AuthPage() {
  const [view, setView]             = useState(VIEW.LOGIN);
  const [isSubmitting, setSubmitting] = useState(false);
  const [errors, setErrors]         = useState({});
  const [pendingEmail, setPendingEmail] = useState('');

  const [loginForm,    setLoginForm]    = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', confirmPassword: '', agreeTerms: false });
  const [otpCode,      setOtpCode]      = useState('');
  const [forgotEmail,  setForgotEmail]  = useState('');
  const [resetForm,    setResetForm]    = useState({ token: '', password: '', confirmPassword: '' });

  const { login, register, verifyOtp, resendOtp } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const clearErrors = () => setErrors({});

  const apiErr = (e) => {
    const d = e?.response?.data;
    return (typeof d?.message === 'string' && d.message) || (typeof d?.error === 'string' && d.error) || null;
  };

  // Link đặt lại mật khẩu từ email: /auth?resetToken=...
  useEffect(() => {
    const t = searchParams.get('resetToken');
    if (t) {
      setResetForm((prev) => ({ ...prev, token: t }));
      setView(VIEW.FORGOT_RESET);
    }
  }, [searchParams]);

  const goHome = useCallback((userData) => {
    const isAdminUser = userData?.role?.toUpperCase() === 'ADMIN';
    const from = location.state?.from?.pathname || (isAdminUser ? '/admin' : '/');
    navigate(from, { replace: true });
  }, [location, navigate]);

  /* ─────────────────────────────────────────────────────
     EMAIL/PASSWORD LOGIN
  ───────────────────────────────────────────────────── */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!loginForm.email.includes('@')) errs.loginEmail = 'Email không hợp lệ';
    else if (!isStudentEmail(loginForm.email)) errs.loginEmail = 'Chỉ đăng nhập bằng email .edu.vn';
    if (!loginForm.password)            errs.loginPassword = 'Mật khẩu là bắt buộc';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const userData = await login(loginForm.email, loginForm.password);
      toast.success('Đăng nhập thành công!');
      goHome(userData);
    } catch (err) {
      toast.error(err.message || 'Đăng nhập thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─────────────────────────────────────────────────────
     REGISTER
  ───────────────────────────────────────────────────── */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!registerForm.username || registerForm.username.length < 3) errs.username = 'Tên phải có ít nhất 3 ký tự';
    if (!registerForm.email.includes('@'))  errs.email = 'Email không hợp lệ';
    if (!isStudentEmail(registerForm.email)) errs.email = 'Chỉ chấp nhận email .edu.vn';
    if (!registerForm.password || registerForm.password.length < 8) errs.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    if (registerForm.password !== registerForm.confirmPassword) errs.confirmPassword = 'Mật khẩu xác nhận không khớp';
    if (!registerForm.agreeTerms) errs.agreeTerms = 'Bạn phải đồng ý với điều khoản';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await register(registerForm.username, registerForm.email, registerForm.password);
      setPendingEmail(registerForm.email);
      setOtpCode('');
      clearErrors();
      setView(VIEW.OTP);
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email và nhập mã OTP.');
    } catch (err) {
      toast.error(err.message || 'Đăng ký thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─────────────────────────────────────────────────────
     OTP
  ───────────────────────────────────────────────────── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) { setErrors({ otp: 'Vui lòng nhập mã OTP hợp lệ' }); return; }
    setSubmitting(true);
    try {
      const userData = await verifyOtp(pendingEmail, otpCode);
      toast.success(`Chào mừng ${userData.username}! Đã đăng nhập.`);
      clearErrors();
      goHome(userData);
    } catch (err) {
      toast.error(err.message || 'Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try { await resendOtp(pendingEmail); toast.success('Đã gửi lại OTP. Kiểm tra email.'); }
    catch (err) { toast.error(err.message || 'Không thể gửi lại mã OTP.'); }
  };

  /* ─────────────────────────────────────────────────────
     FORGOT PASSWORD
  ───────────────────────────────────────────────────── */
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.includes('@')) { setErrors({ forgotEmail: 'Email không hợp lệ' }); return; }
    if (!isStudentEmail(forgotEmail)) { setErrors({ forgotEmail: 'Chỉ hỗ trợ email .edu.vn' }); return; }
    setSubmitting(true);
    try {
      const res = await authApi.forgotPassword({ email: forgotEmail });
      toast.success(res.data?.message || 'Đã gửi hướng dẫn (nếu email tồn tại).');
      setView(VIEW.FORGOT_SENT);
      clearErrors();
    } catch (err) {
      toast.error(apiErr(err) || 'Không thể gửi email đặt lại mật khẩu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!resetForm.token.trim())            errs.resetToken = 'Vui lòng nhập token từ email';
    if (!resetForm.password || resetForm.password.length < 8) errs.resetPassword = 'Mật khẩu phải có ít nhất 8 ký tự (theo server)';
    if (resetForm.password !== resetForm.confirmPassword) errs.resetConfirm = 'Mật khẩu xác nhận không khớp';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const res = await authApi.resetPassword({
        token: resetForm.token.trim(),
        newPassword: resetForm.password,
      });
      toast.success(res.data?.message || 'Đặt lại mật khẩu thành công! Hãy đăng nhập.');
      setView(VIEW.LOGIN);
      setResetForm({ token: '', password: '', confirmPassword: '' });
      setSearchParams({}, { replace: true });
      clearErrors();
    } catch (err) {
      toast.error(apiErr(err) || 'Token không hợp lệ hoặc đã hết hạn.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────── */
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <EduCycleLogo size={52} variant="inverse" title="EduCycle" />
            <span className="auth-logo-wordmark">EduCycle</span>
          </div>
          <div className="auth-tagline">Sàn giao dịch tài liệu dành cho sinh viên</div>
        </div>

        {/* Tabs */}
        {(view === VIEW.LOGIN || view === VIEW.REGISTER) && (
          <div className="auth-tabs">
            <button className={`auth-tab-btn ${view === VIEW.LOGIN ? 'active' : ''}`} onClick={() => { setView(VIEW.LOGIN); clearErrors(); }}>Đăng nhập</button>
            <button className={`auth-tab-btn ${view === VIEW.REGISTER ? 'active' : ''}`} onClick={() => { setView(VIEW.REGISTER); clearErrors(); }}>Đăng ký</button>
          </div>
        )}

        <div className="auth-content">

          {/* ══ LOGIN ══ */}
          {view === VIEW.LOGIN && (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <div className="auth-edu-notice">
                <span>Chỉ email <strong>.edu.vn</strong>. Nếu vừa đăng ký, hãy nhập OTP từ hộp thư trường trước khi đăng nhập.</span>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="login-email">Email</label>
                <input type="email" id="login-email" className={`auth-input ${errors.loginEmail ? 'error' : ''}`}
                  placeholder="ten@truong.edu.vn"
                  value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
                <div className={`auth-error ${errors.loginEmail ? 'show' : ''}`}>{errors.loginEmail}</div>
              </div>

              <div className="auth-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <label className="auth-label" htmlFor="login-password" style={{ margin: 0 }}>Mật khẩu</label>
                  <button type="button" className="auth-link-btn" onClick={() => { setView(VIEW.FORGOT); clearErrors(); }}>Quên mật khẩu?</button>
                </div>
                <input type="password" id="login-password" className={`auth-input ${errors.loginPassword ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
                <div className={`auth-error ${errors.loginPassword ? 'show' : ''}`}>{errors.loginPassword}</div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </button>
            </form>
          )}

          {/* ══ REGISTER ══ */}
          {view === VIEW.REGISTER && (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <div className="auth-edu-notice">
                <span>Chỉ email <strong>.edu.vn</strong>. Sau khi tạo tài khoản, mã OTP gửi về đúng email đó — nhập OTP mới vào được hệ thống.</span>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reg-username">Tên người dùng</label>
                <input type="text" id="reg-username" className={`auth-input ${errors.username ? 'error' : ''}`}
                  placeholder="Nguyễn Văn A"
                  value={registerForm.username} onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })} />
                <div className={`auth-error ${errors.username ? 'show' : ''}`}>{errors.username}</div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reg-email">Email sinh viên <span style={{ color: 'var(--primary-500)', fontSize: 'var(--text-xs)' }}>(.edu.vn)</span></label>
                <input type="email" id="reg-email" className={`auth-input ${errors.email ? 'error' : ''}`}
                  placeholder="ten@truong.edu.vn"
                  value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} />
                <div className={`auth-error ${errors.email ? 'show' : ''}`}>{errors.email}</div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reg-password">Mật khẩu</label>
                <input type="password" id="reg-password" className={`auth-input ${errors.password ? 'error' : ''}`}
                  placeholder="Ít nhất 8 ký tự"
                  value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} />
                <div className={`auth-error ${errors.password ? 'show' : ''}`}>{errors.password}</div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reg-confirm">Xác nhận mật khẩu</label>
                <input type="password" id="reg-confirm" className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={registerForm.confirmPassword} onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} />
                <div className={`auth-error ${errors.confirmPassword ? 'show' : ''}`}>{errors.confirmPassword}</div>
              </div>

              <div className="auth-checkbox-group">
                <input type="checkbox" id="terms" checked={registerForm.agreeTerms} onChange={e => setRegisterForm({ ...registerForm, agreeTerms: e.target.checked })} />
                <label htmlFor="terms">Tôi đồng ý với Điều khoản & Điều kiện</label>
              </div>
              <div className={`auth-error ${errors.agreeTerms ? 'show' : ''}`} style={{ marginBottom: 'var(--space-3)' }}>{errors.agreeTerms}</div>

              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}
              </button>
            </form>
          )}

          {/* ══ OTP ══ */}
          {view === VIEW.OTP && (
            <form className="auth-form" onSubmit={handleVerifyOtp}>
              <div className="auth-otp-hero">
                <h3>Xác thực email</h3>
                <p>Mã OTP đã gửi đến<br /><strong>{pendingEmail}</strong></p>
              </div>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="otp-code">Mã OTP</label>
                <input type="text" id="otp-code" className={`auth-input auth-otp-input ${errors.otp ? 'error' : ''}`}
                  placeholder="● ● ● ● ● ●"
                  value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6} autoFocus />
                <div className={`auth-error ${errors.otp ? 'show' : ''}`}>{errors.otp}</div>
              </div>
              <div className="auth-otp-note">Nhập đúng mã trong email .edu.vn. Sau khi xác nhận, bạn được đăng nhập tự động.</div>
              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Đang xác thực...' : 'Xác Nhận'}
              </button>
              <div className="auth-footer">
                <button type="button" className="auth-link-btn" onClick={handleResendOtp}>Gửi lại OTP</button>
                {' · '}
                <button type="button" className="auth-link-btn" onClick={() => { setView(VIEW.REGISTER); clearErrors(); }}>Đổi thông tin</button>
              </div>
            </form>
          )}

          {/* ══ FORGOT ══ */}
          {view === VIEW.FORGOT && (
            <form className="auth-form" onSubmit={handleForgotSubmit}>
              <div className="auth-back-header">
                <button type="button" className="auth-link-btn" onClick={() => { setView(VIEW.LOGIN); clearErrors(); }}>Quay lại đăng nhập</button>
                <h3>Quên mật khẩu</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                  Nhập email sinh viên. Chúng tôi sẽ gửi link đặt lại mật khẩu.
                </p>
              </div>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="forgot-email">Email sinh viên (.edu.vn)</label>
                <input type="email" id="forgot-email" className={`auth-input ${errors.forgotEmail ? 'error' : ''}`}
                  placeholder="ten@truong.edu.vn" autoFocus
                  value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                <div className={`auth-error ${errors.forgotEmail ? 'show' : ''}`}>{errors.forgotEmail}</div>
              </div>
              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi link đặt lại'}
              </button>
            </form>
          )}

          {/* ══ FORGOT SENT ══ */}
          {view === VIEW.FORGOT_SENT && (
            <div className="auth-form">
              <div className="auth-otp-hero">
                <h3>Kiểm tra email</h3>
                <p>Link đặt lại đã gửi đến<br /><strong>{forgotEmail}</strong></p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>Không thấy? Kiểm tra thư mục Spam.</p>
              </div>
              <button type="button" className="auth-submit-btn" onClick={() => setView(VIEW.FORGOT_RESET)}>
                Tôi đã có token — đặt lại mật khẩu
              </button>
              <div className="auth-footer">
                <button type="button" className="auth-link-btn" onClick={() => { setForgotEmail(''); setView(VIEW.FORGOT); clearErrors(); }}>Thử email khác</button>
                {' · '}
                <button type="button" className="auth-link-btn" onClick={() => { setView(VIEW.LOGIN); clearErrors(); }}>Đăng nhập</button>
              </div>
            </div>
          )}

          {/* ══ RESET PASSWORD ══ */}
          {view === VIEW.FORGOT_RESET && (
            <form className="auth-form" onSubmit={handleResetSubmit}>
              <div className="auth-back-header">
                <button type="button" className="auth-link-btn" onClick={() => setView(VIEW.FORGOT_SENT)}>Quay lại</button>
                <h3>Đặt lại mật khẩu</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>Nhập token từ email và mật khẩu mới.</p>
              </div>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reset-token">Token từ email</label>
                <input type="text" id="reset-token" className={`auth-input ${errors.resetToken ? 'error' : ''}`}
                  placeholder="Dán token vào đây..." autoFocus
                  value={resetForm.token} onChange={e => setResetForm({ ...resetForm, token: e.target.value })} />
                <div className={`auth-error ${errors.resetToken ? 'show' : ''}`}>{errors.resetToken}</div>
              </div>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reset-password">Mật khẩu mới</label>
                <input type="password" id="reset-password" className={`auth-input ${errors.resetPassword ? 'error' : ''}`}
                  placeholder="Ít nhất 8 ký tự"
                  value={resetForm.password} onChange={e => setResetForm({ ...resetForm, password: e.target.value })} />
                <div className={`auth-error ${errors.resetPassword ? 'show' : ''}`}>{errors.resetPassword}</div>
              </div>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reset-confirm">Xác nhận mật khẩu mới</label>
                <input type="password" id="reset-confirm" className={`auth-input ${errors.resetConfirm ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={resetForm.confirmPassword} onChange={e => setResetForm({ ...resetForm, confirmPassword: e.target.value })} />
                <div className={`auth-error ${errors.resetConfirm ? 'show' : ''}`}>{errors.resetConfirm}</div>
              </div>
              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
