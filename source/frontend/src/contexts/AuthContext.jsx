import { createContext, useContext, useState } from 'react';
import { authApi } from '../api/endpoints';
import { clearAuthStorage, loadAuthSession } from '../utils/safeSession';

const AuthContext = createContext(null);

function persistSession(userData, tokenValue, refreshTokenValue = null) {
  localStorage.setItem('token', tokenValue);
  localStorage.setItem('user', JSON.stringify(userData));
  if (refreshTokenValue) {
    localStorage.setItem('refreshToken', refreshTokenValue);
  } else {
    localStorage.removeItem('refreshToken');
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadAuthSession());
  const { user, token } = session;

  const loading = false;

  const applySession = (nextUser, nextToken, refreshTokenValue = null) => {
    if (!nextUser || !nextToken) {
      clearAuthStorage();
      setSession({ user: null, token: null });
      return;
    }
    persistSession(nextUser, nextToken, refreshTokenValue);
    setSession({ user: nextUser, token: nextToken });
  };

  const login = async (email, password) => {
    if (!email || !password) throw new Error('Email và mật khẩu là bắt buộc');
    try {
      const res = await authApi.login({ email, password });
      const data = res.data;
      const userData = {
        id: data.userId,
        username: data.username,
        email: data.email,
        role: data.role || 'USER',
        // Issue #1: mặc định false thay vì true — không giả vờ email đã xác thực
        emailVerified: data.emailVerified ?? false,
        phoneVerified: data.phoneVerified ?? false,
        phone: data.phone ?? null,
      };
      applySession(userData, data.token, data.refreshToken || null);
      return userData;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        (err.code === 'ERR_NETWORK' ? 'Không thể kết nối server. Kiểm tra backend đang chạy.' : null) ||
        err.response?.data ||
        'Đăng nhập thất bại. Kiểm tra lại email và mật khẩu.';
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  const register = async (username, email, password) => {
    if (!username || !email || !password) throw new Error('Tất cả các trường là bắt buộc');
    try {
      const res = await authApi.register({ username, email, password });
      const data = res.data;
      if (data.token) {
        const userData = {
          id: data.userId,
          username: data.username || username,
          email: data.email || email,
          role: data.role || 'USER',
          emailVerified: data.emailVerified ?? false,
          phoneVerified: data.phoneVerified ?? false,
          phone: data.phone ?? null,
        };
        applySession(userData, data.token, data.refreshToken || null);
        return userData;
      }
      return {
        email: data.email || email,
        username: data.username || username,
        emailVerified: false,
        message: data.message || 'Vui lòng kiểm tra email để xác thực OTP.',
      };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        (err.code === 'ERR_NETWORK' ? 'Không thể kết nối server. Kiểm tra backend đang chạy.' : null) ||
        err.response?.data ||
        'Đăng ký thất bại. Vui lòng thử lại.';
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  // FIX: BE VerifyOtpRequest expects { email, otp } — NOT { email, otpCode }
  const verifyOtp = async (email, otpCode) => {
    if (!email || !otpCode) throw new Error('Email và mã OTP là bắt buộc');
    const res = await authApi.verifyOtp({ email, otp: otpCode });
    // Cập nhật trạng thái email đã xác thực
    updateProfile({ emailVerified: true });
    return res.data;
  };

  const resendOtp = async (email) => {
    if (!email) throw new Error('Email là bắt buộc');
    const res = await authApi.resendOtp({ email });
    return res.data;
  };

  // FIX: BE SocialLoginRequest expects { provider, token } — NOT { provider, idToken }
  const socialLogin = async (provider, idToken) => {
    if (!provider || !idToken) throw new Error('Nhà cung cấp và token là bắt buộc');
    const res = await authApi.socialLogin({ provider, token: idToken });
    const data = res.data;
    const userData = {
      id: data.userId,
      username: data.username,
      email: data.email,
      role: data.role || 'USER',
      emailVerified: data.emailVerified ?? false,
      phoneVerified: data.phoneVerified ?? false,
      phone: data.phone ?? null,
    };
    applySession(userData, data.token, data.refreshToken || null);
    return userData;
  };

  // Issue #1 FIX: verifyPhone gọi BE thật + cập nhật user.phoneVerified = true
  // BE /auth/verify-phone nhận { phone } và đánh dấu verified trực tiếp (không OTP riêng)
  const verifyPhone = async (phoneNumber) => {
    if (!phoneNumber) throw new Error('Số điện thoại là bắt buộc');
    const res = await authApi.verifyPhone({ phone: phoneNumber });
    // Cập nhật state: phone đã xác thực
    updateProfile({ phone: phoneNumber, phoneVerified: true });
    return res.data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try { await authApi.logout({ refreshToken }); } catch { /* best-effort */ }
    }
    clearAuthStorage();
    setSession({ user: null, token: null });
  };

  const updateProfile = (updates) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    localStorage.setItem('user', JSON.stringify(updated));
    setSession((s) => ({ ...s, user: updated }));
  };

  const handleOAuthCallback = (jwtToken) => {
    if (!jwtToken || typeof jwtToken !== 'string') return;
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      const userData = {
        id: payload.nameid || payload.sub || payload.userId,
        username: payload.unique_name || payload.name || payload.username,
        email: payload.email,
        role: payload.role || 'USER',
        emailVerified: payload.emailVerified ?? true,
        phoneVerified: payload.phoneVerified ?? false,
        phone: payload.phone ?? null,
      };
      applySession(userData, jwtToken, payload.refreshToken || null);
    } catch {
      clearAuthStorage();
      setSession({ user: null, token: null });
    }
  };

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const isAuthenticated = !!(token && user?.id);

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout, updateProfile,
      verifyOtp, resendOtp, socialLogin, verifyPhone,
      handleOAuthCallback,
      isAdmin, isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong AuthProvider');
  return ctx;
}
