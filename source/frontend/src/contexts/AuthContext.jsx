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

function decodeJwtPayload(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.nameid || payload.sub || payload.userId,
      username: payload.unique_name || payload.name || payload.username,
      email: payload.email,
      role: payload.role || 'User',
    };
  } catch {
    return null;
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

  /**
   * Login — backend only (no mock bypass)
   */
  const login = async (email, password) => {
    if (!email || !password) throw new Error('Email và mật khẩu là bắt buộc');

    try {
      const res = await authApi.login({ email, password });
      const data = res.data;
      const jwt = data.token;
      const userData = {
        id: data.userId,
        username: data.username,
        email: data.email,
        role: data.role || 'User',
        isEmailVerified: data.isEmailVerified ?? true,
      };

      applySession(userData, jwt, data.refreshToken || null);
      return userData;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        (err.code === 'ERR_NETWORK' ? 'Không thể kết nối server. Vui lòng thử lại sau.' : null) ||
        err.response?.data ||
        'Đăng nhập thất bại. Kiểm tra lại email và mật khẩu.';
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  /**
   * Register — backend only (no mock bypass)
   */
  const register = async (username, email, password) => {
    if (!username || !email || !password) throw new Error('Tất cả các trường là bắt buộc');

    try {
      const res = await authApi.register({ username, email, password });
      const data = res.data;
      if (data.token) {
        const jwt = data.token;
        const userData = {
          id: data.userId,
          username: data.username || username,
          email: data.email || email,
          role: data.role || 'User',
          isEmailVerified: data.isEmailVerified ?? false,
        };

        applySession(userData, jwt, data.refreshToken || null);
        return userData;
      }

      // Fallback: backend might not return token until verified
      return {
        email: data.email || email,
        username: data.username || username,
        isEmailVerified: false,
        message: data.message || 'Vui lòng kiểm tra email để xác thực OTP.',
      };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        (err.code === 'ERR_NETWORK' ? 'Không thể kết nối server. Vui lòng thử lại sau.' : null) ||
        err.response?.data ||
        'Đăng ký thất bại. Vui lòng thử lại.';
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  const verifyOtp = async (email, otpCode) => {
    if (!email || !otpCode) throw new Error('Email và mã OTP là bắt buộc');
    const res = await authApi.verifyOtp({ email, otpCode });
    return res.data;
  };

  const resendOtp = async (email) => {
    if (!email) throw new Error('Email là bắt buộc');
    const res = await authApi.resendOtp({ email });
    return res.data;
  };

  const socialLogin = async (provider, idToken) => {
    if (!provider || !idToken) throw new Error('Provider và idToken là bắt buộc');

    const res = await authApi.socialLogin({ provider, idToken });
    const data = res.data;
    const jwt = data.token;
    const userData = {
      id: data.userId,
      username: data.username,
      email: data.email,
      role: data.role || 'User',
    };

    applySession(userData, jwt, data.refreshToken || null);
    return userData;
  };

  const verifyPhone = async (phoneNumber, otpCode) => {
    if (!phoneNumber || !otpCode) throw new Error('Số điện thoại và mã OTP là bắt buộc');
    const res = await authApi.verifyPhone({ phoneNumber, otpCode });
    return res.data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await authApi.logout({ refreshToken });
      } catch {
        // best-effort
      }
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

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const isAuthenticated = !!(token && user?.id);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        socialLogin,
        verifyPhone,
        logout,
        updateProfile,
        isAdmin,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
