import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { authApi } from '../api/endpoints';
import EduCycleLogo from '../components/branding/EduCycleLogo';
import {
  loginFormSchema,
  registerFormSchema,
  forgotEmailSchema,
  resetPasswordFormSchema,
  otpFormSchema,
} from '../api/formSchemas';
import './AuthPage.css';

const VIEW = {
  LOGIN: 'login',
  REGISTER: 'register',
  OTP: 'otp',
  FORGOT: 'forgot',
  FORGOT_SENT: 'forgot_sent',
  FORGOT_RESET: 'forgot_reset',
};

export default function AuthPage() {
  const [view, setView] = useState(VIEW.LOGIN);
  const [isSubmitting, setSubmitting] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const { login, register: authRegister, verifyOtp, resendOtp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const loginForm = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const registerForm = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
    mode: 'onTouched',
  });

  const forgotForm = useForm({
    resolver: zodResolver(forgotEmailSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  });

  const resetFormHook = useForm({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { token: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const otpForm = useForm({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { otp: '' },
    mode: 'onTouched',
  });

  const apiErr = (e) => {
    const d = e?.response?.data;
    return (typeof d?.message === 'string' && d.message) || (typeof d?.error === 'string' && d.error) || null;
  };

  useEffect(() => {
    const t = searchParams.get('resetToken');
    if (t) {
      resetFormHook.setValue('token', t);
      setView(VIEW.FORGOT_RESET);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setValue stable; run when URL token appears
  }, [searchParams]);

  const goHome = (userData) => {
    const isAdminUser = userData?.role?.toUpperCase() === 'ADMIN';
    const from = location.state?.from?.pathname || (isAdminUser ? '/admin' : '/');
    navigate(from, { replace: true });
  };

  const clearFormErrors = () => {
    loginForm.clearErrors();
    registerForm.clearErrors();
    forgotForm.clearErrors();
    resetFormHook.clearErrors();
    otpForm.clearErrors();
  };

  const handleLoginSubmit = loginForm.handleSubmit(async (data) => {
    setSubmitting(true);
    try {
      const userData = await login(data.email, data.password);
      toast.success('Đăng nhập thành công!');
      goHome(userData);
    } catch (err) {
      toast.error(err.message || 'Đăng nhập thất bại.');
    } finally {
      setSubmitting(false);
    }
  });

  const handleRegisterSubmit = registerForm.handleSubmit(async (data) => {
    setSubmitting(true);
    try {
      await authRegister(data.username, data.email, data.password);
      setPendingEmail(data.email);
      otpForm.reset({ otp: '' });
      clearFormErrors();
      setView(VIEW.OTP);
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email và nhập mã OTP.');
    } catch (err) {
      toast.error(err.message || 'Đăng ký thất bại.');
    } finally {
      setSubmitting(false);
    }
  });

  const handleVerifyOtp = otpForm.handleSubmit(async (data) => {
    setSubmitting(true);
    try {
      const userData = await verifyOtp(pendingEmail, data.otp);
      toast.success(`Chào mừng ${userData.username}! Đã đăng nhập.`);
      otpForm.clearErrors();
      goHome(userData);
    } catch (err) {
      toast.error(err.message || 'Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setSubmitting(false);
    }
  });

  const handleResendOtp = async () => {
    try {
      await resendOtp(pendingEmail);
      toast.success('Đã gửi lại OTP. Kiểm tra email.');
    } catch (err) {
      toast.error(err.message || 'Không thể gửi lại mã OTP.');
    }
  };

  const handleForgotSubmit = forgotForm.handleSubmit(async (data) => {
    setSubmitting(true);
    try {
      const res = await authApi.forgotPassword({ email: data.email });
      toast.success(res.data?.message || 'Đã gửi hướng dẫn (nếu email tồn tại).');
      setView(VIEW.FORGOT_SENT);
      forgotForm.clearErrors();
    } catch (err) {
      toast.error(apiErr(err) || 'Không thể gửi email đặt lại mật khẩu.');
    } finally {
      setSubmitting(false);
    }
  });

  const handleResetSubmit = resetFormHook.handleSubmit(async (data) => {
    setSubmitting(true);
    try {
      const res = await authApi.resetPassword({
        token: data.token.trim(),
        newPassword: data.password,
      });
      toast.success(res.data?.message || 'Đặt lại mật khẩu thành công! Hãy đăng nhập.');
      setView(VIEW.LOGIN);
      resetFormHook.reset({ token: '', password: '', confirmPassword: '' });
      setSearchParams({}, { replace: true });
      resetFormHook.clearErrors();
    } catch (err) {
      toast.error(apiErr(err) || 'Token không hợp lệ hoặc đã hết hạn.');
    } finally {
      setSubmitting(false);
    }
  });

  const {
    register: bindLogin,
    formState: { errors: loginErrors },
  } = loginForm;
  const {
    register: bindRegister,
    formState: { errors: regErrors },
  } = registerForm;
  const {
    register: bindForgot,
    formState: { errors: forgotErrors },
  } = forgotForm;
  const {
    register: bindReset,
    formState: { errors: resetErrors },
  } = resetFormHook;
  const {
    register: bindOtp,
    formState: { errors: otpErrors },
  } = otpForm;

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

        {(view === VIEW.LOGIN || view === VIEW.REGISTER) && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${view === VIEW.LOGIN ? 'active' : ''}`}
              onClick={() => {
                setView(VIEW.LOGIN);
                clearFormErrors();
              }}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${view === VIEW.REGISTER ? 'active' : ''}`}
              onClick={() => {
                setView(VIEW.REGISTER);
                clearFormErrors();
              }}
            >
              Đăng ký
            </button>
          </div>
        )}

        <div className="auth-content">
          {view === VIEW.LOGIN && (
            <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
              <div className="auth-edu-notice">
                <span>
                  Đăng ký bằng email <strong>.edu.vn</strong>, xác thực OTP qua hộp thư trường, sau đó mới đăng nhập
                  bằng email và mật khẩu.
                </span>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="login-email">
                  Email
                </label>
                <input
                  type="email"
                  id="login-email"
                  autoComplete="username"
                  className={`auth-input ${loginErrors.email ? 'error' : ''}`}
                  placeholder="ten@truong.edu.vn"
                  {...bindLogin('email')}
                />
                <div className={`auth-error ${loginErrors.email ? 'show' : ''}`}>{loginErrors.email?.message}</div>
              </div>

              <div className="auth-form-group">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  <label className="auth-label" htmlFor="login-password" style={{ margin: 0 }}>
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => {
                      setView(VIEW.FORGOT);
                      clearFormErrors();
                    }}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <input
                  type="password"
                  id="login-password"
                  autoComplete="current-password"
                  className={`auth-input ${loginErrors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  {...bindLogin('password')}
                />
                <div className={`auth-error ${loginErrors.password ? 'show' : ''}`}>{loginErrors.password?.message}</div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </button>
            </form>
          )}

          {view === VIEW.REGISTER && (
            <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
              <div className="auth-edu-notice">
                <span>
                  Chỉ email <strong>.edu.vn</strong>. Sau khi tạo tài khoản, mã OTP gửi về đúng email đó — nhập OTP mới
                  vào được hệ thống.
                </span>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reg-username">
                  Tên người dùng
                </label>
                <input
                  type="text"
                  id="reg-username"
                  autoComplete="nickname"
                  className={`auth-input ${regErrors.username ? 'error' : ''}`}
                  placeholder="Nguyễn Văn A"
                  {...bindRegister('username')}
                />
                <div className={`auth-error ${regErrors.username ? 'show' : ''}`}>{regErrors.username?.message}</div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reg-email">
                  Email sinh viên{' '}
                  <span style={{ color: 'var(--primary-500)', fontSize: 'var(--text-xs)' }}>(.edu.vn)</span>
                </label>
                <input
                  type="email"
                  id="reg-email"
                  autoComplete="email"
                  className={`auth-input ${regErrors.email ? 'error' : ''}`}
                  placeholder="ten@truong.edu.vn"
                  {...bindRegister('email')}
                />
                <div className={`auth-error ${regErrors.email ? 'show' : ''}`}>{regErrors.email?.message}</div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reg-password">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  id="reg-password"
                  autoComplete="new-password"
                  className={`auth-input ${regErrors.password ? 'error' : ''}`}
                  placeholder="Ít nhất 8 ký tự"
                  {...bindRegister('password')}
                />
                <div className={`auth-error ${regErrors.password ? 'show' : ''}`}>{regErrors.password?.message}</div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reg-confirm">
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  id="reg-confirm"
                  autoComplete="new-password"
                  className={`auth-input ${regErrors.confirmPassword ? 'error' : ''}`}
                  placeholder="••••••••"
                  {...bindRegister('confirmPassword')}
                />
                <div className={`auth-error ${regErrors.confirmPassword ? 'show' : ''}`}>
                  {regErrors.confirmPassword?.message}
                </div>
              </div>

              <div className="auth-checkbox-group">
                <input type="checkbox" id="terms" {...bindRegister('agreeTerms')} />
                <label htmlFor="terms">Tôi đồng ý với Điều khoản & Điều kiện</label>
              </div>
              <div className={`auth-error ${regErrors.agreeTerms ? 'show' : ''}`} style={{ marginBottom: 'var(--space-3)' }}>
                {regErrors.agreeTerms?.message}
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}
              </button>
            </form>
          )}

          {view === VIEW.OTP && (
            <form className="auth-form" onSubmit={handleVerifyOtp} noValidate>
              <div className="auth-otp-hero">
                <h3>Xác thực email</h3>
                <p>
                  Mã OTP đã gửi đến
                  <br />
                  <strong>{pendingEmail}</strong>
                </p>
              </div>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="otp-code">
                  Mã OTP
                </label>
                <input
                  type="text"
                  id="otp-code"
                  inputMode="numeric"
                  className={`auth-input auth-otp-input ${otpErrors.otp ? 'error' : ''}`}
                  placeholder="● ● ● ● ● ●"
                  maxLength={6}
                  autoFocus
                  {...bindOtp('otp')}
                />
                <div className={`auth-error ${otpErrors.otp ? 'show' : ''}`}>{otpErrors.otp?.message}</div>
              </div>
              <div className="auth-otp-note">Nhập đúng mã trong email .edu.vn. Sau khi xác nhận, bạn được đăng nhập tự động.</div>
              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Đang xác thực...' : 'Xác Nhận'}
              </button>
              <div className="auth-footer">
                <button type="button" className="auth-link-btn" onClick={handleResendOtp}>
                  Gửi lại OTP
                </button>
                {' · '}
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => {
                    setView(VIEW.REGISTER);
                    clearFormErrors();
                  }}
                >
                  Đổi thông tin
                </button>
              </div>
            </form>
          )}

          {view === VIEW.FORGOT && (
            <form className="auth-form" onSubmit={handleForgotSubmit} noValidate>
              <div className="auth-back-header">
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => {
                    setView(VIEW.LOGIN);
                    clearFormErrors();
                  }}
                >
                  Quay lại đăng nhập
                </button>
                <h3>Quên mật khẩu</h3>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)',
                    marginBottom: 'var(--space-4)',
                  }}
                >
                  Nhập email đã đăng ký. Nếu email tồn tại, bạn sẽ nhận hướng dẫn đặt lại mật khẩu.
                </p>
              </div>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="forgot-email">
                  Email
                </label>
                <input
                  type="email"
                  id="forgot-email"
                  autoComplete="email"
                  className={`auth-input ${forgotErrors.email ? 'error' : ''}`}
                  placeholder="ten@truong.edu.vn"
                  autoFocus
                  {...bindForgot('email')}
                />
                <div className={`auth-error ${forgotErrors.email ? 'show' : ''}`}>{forgotErrors.email?.message}</div>
              </div>
              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi link đặt lại'}
              </button>
            </form>
          )}

          {view === VIEW.FORGOT_SENT && (
            <div className="auth-form">
              <div className="auth-otp-hero">
                <h3>Kiểm tra email</h3>
                <p>
                  Link đặt lại đã gửi đến
                  <br />
                  <strong>{forgotForm.getValues('email')}</strong>
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                  Không thấy? Kiểm tra thư mục Spam.
                </p>
              </div>
              <button type="button" className="auth-submit-btn" onClick={() => setView(VIEW.FORGOT_RESET)}>
                Tôi đã có token — đặt lại mật khẩu
              </button>
              <div className="auth-footer">
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => {
                    forgotForm.reset({ email: '' });
                    setView(VIEW.FORGOT);
                    clearFormErrors();
                  }}
                >
                  Thử email khác
                </button>
                {' · '}
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => {
                    setView(VIEW.LOGIN);
                    clearFormErrors();
                  }}
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          )}

          {view === VIEW.FORGOT_RESET && (
            <form className="auth-form" onSubmit={handleResetSubmit} noValidate>
              <div className="auth-back-header">
                <button type="button" className="auth-link-btn" onClick={() => setView(VIEW.FORGOT_SENT)}>
                  Quay lại
                </button>
                <h3>Đặt lại mật khẩu</h3>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)',
                    marginBottom: 'var(--space-4)',
                  }}
                >
                  Nhập token từ email và mật khẩu mới.
                </p>
              </div>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reset-token">
                  Token từ email
                </label>
                <input
                  type="text"
                  id="reset-token"
                  className={`auth-input ${resetErrors.token ? 'error' : ''}`}
                  placeholder="Dán token vào đây..."
                  autoFocus
                  {...bindReset('token')}
                />
                <div className={`auth-error ${resetErrors.token ? 'show' : ''}`}>{resetErrors.token?.message}</div>
              </div>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reset-password">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  id="reset-password"
                  autoComplete="new-password"
                  className={`auth-input ${resetErrors.password ? 'error' : ''}`}
                  placeholder="Ít nhất 8 ký tự"
                  {...bindReset('password')}
                />
                <div className={`auth-error ${resetErrors.password ? 'show' : ''}`}>{resetErrors.password?.message}</div>
              </div>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="reset-confirm">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  id="reset-confirm"
                  autoComplete="new-password"
                  className={`auth-input ${resetErrors.confirmPassword ? 'error' : ''}`}
                  placeholder="••••••••"
                  {...bindReset('confirmPassword')}
                />
                <div className={`auth-error ${resetErrors.confirmPassword ? 'show' : ''}`}>
                  {resetErrors.confirmPassword?.message}
                </div>
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
