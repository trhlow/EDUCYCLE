import { useState } from 'react';
import './AuthPage.css';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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
      newErrors.loginEmail = 'Please enter a valid email';
    }
    if (!loginForm.password) {
      newErrors.loginPassword = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const newErrors = {};
    if (!registerForm.username || registerForm.username.length < 3) {
      newErrors.registerUsername = 'Username must be at least 3 characters';
    }
    if (!registerForm.email || !registerForm.email.includes('@')) {
      newErrors.registerEmail = 'Please enter a valid email';
    }
    if (!registerForm.password || registerForm.password.length < 8) {
      newErrors.registerPassword = 'Password must be at least 8 characters';
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.registerConfirm = 'Passwords do not match';
    }
    if (!registerForm.agreeTerms) {
      newErrors.registerTerms = 'You must agree to the Terms & Conditions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setLoginSuccess(true);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setRegisterSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => {
        setRegisterForm({ username: '', email: '', password: '', confirmPassword: '', agreeTerms: false });
        setRegisterSuccess(false);
      }, 3000);
    }, 1000);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrors({});
    setLoginSuccess(false);
    setRegisterSuccess(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">🎓 EduCycle</div>
          <div className="auth-tagline">Your marketplace for educational excellence</div>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Login
          </button>
          <button
            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => switchTab('register')}
          >
            Register
          </button>
        </div>

        <div className="auth-content">
          {activeTab === 'login' && (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <div className={`auth-success ${loginSuccess ? 'show' : ''}`}>
                ✓ Login successful! Redirecting...
              </div>

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
                <label className="auth-label" htmlFor="login-password">Password</label>
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
                <label htmlFor="remember-me">Remember me</label>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="auth-divider">or continue with</div>

              <div className="auth-social-login">
                <button type="button" className="auth-social-btn">Google</button>
                <button type="button" className="auth-social-btn">Facebook</button>
              </div>

              <div className="auth-footer">
                <a href="#">Forgot password?</a>
              </div>
            </form>
          )}

          {activeTab === 'register' && (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <div className={`auth-success ${registerSuccess ? 'show' : ''}`}>
                ✓ Registration successful! Please check your email to verify your account.
              </div>

              <div className="auth-form-group">
                <label className="auth-label" htmlFor="register-username">Username</label>
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
                <label className="auth-label" htmlFor="register-password">Password</label>
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
                <label className="auth-label" htmlFor="register-confirm">Confirm Password</label>
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
                <label htmlFor="terms">I agree to the Terms & Conditions</label>
              </div>
              <div className={`auth-error ${errors.registerTerms ? 'show' : ''}`} style={{ marginTop: '-1rem', marginBottom: '1rem' }}>
                {errors.registerTerms}
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>

              <div className="auth-footer" style={{ marginTop: 'var(--space-6)' }}>
                Already have an account?{' '}
                <button type="button" onClick={() => switchTab('login')}>
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
