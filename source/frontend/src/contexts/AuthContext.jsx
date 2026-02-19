import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Mock accounts for development/demo (when backend is unavailable)
const MOCK_ACCOUNTS = [
  {
    id: 'admin-001',
    username: 'admin',
    email: 'admin@educycle.com',
    password: '123456',
    role: 'Admin',
  },
];

function saveSession(tokenValue, userData, setToken, setUser) {
  localStorage.setItem('token', tokenValue);
  localStorage.setItem('user', JSON.stringify(userData));
  setToken(tokenValue);
  setUser(userData);
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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login — try real backend first, fall back to mock accounts on network error
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

      saveSession(jwt, userData, setToken, setUser);
      return userData;
    } catch (err) {
      const isNetworkError =
        err.code === 'ERR_NETWORK' ||
        err.message?.includes('Network Error') ||
        !err.response;

      if (isNetworkError) {
        const mockAccount = MOCK_ACCOUNTS.find(
          (a) => (a.email === email || a.username === email) && a.password === password
        );

        if (mockAccount) {
          const mockToken = 'mock-jwt-' + Date.now();
          const userData = {
            id: mockAccount.id,
            username: mockAccount.username,
            email: mockAccount.email,
            role: mockAccount.role,
            isEmailVerified: true,
          };
          saveSession(mockToken, userData, setToken, setUser);
          return userData;
        }

        const mockToken = 'mock-jwt-' + Date.now();
        const userData = {
          id: 'user-' + Date.now(),
          username: email.split('@')[0],
          email,
          role: 'User',
          isEmailVerified: true,
        };
        saveSession(mockToken, userData, setToken, setUser);
        return userData;
      }

      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.response?.data ||
        'Đăng nhập thất bại. Kiểm tra lại email và mật khẩu.';
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  /**
   * Register — returns user data WITHOUT auto-navigating.
   * After register, the UI should show OTP verification form.
   */
  const register = async (username, email, password) => {
    if (!username || !email || !password) throw new Error('Tất cả các trường là bắt buộc');

    try {
      const res = await authApi.register({ username, email, password });
      const data = res.data;

      // Save session but mark as unverified
      if (data.token) {
        const jwt = data.token;
        const userData = {
          id: data.userId,
          username: data.username || username,
          email: data.email || email,
          role: data.role || 'User',
          isEmailVerified: data.isEmailVerified ?? false,
        };
        saveSession(jwt, userData, setToken, setUser);
        return { ...userData, message: data.message };
      }

      // Fallback: backend might not return token until verified
      return {
        email: data.email || email,
        username: data.username || username,
        isEmailVerified: false,
        message: data.message || 'Vui lòng kiểm tra email để xác thực OTP.',
      };
    } catch (err) {
      const isNetworkError =
        err.code === 'ERR_NETWORK' ||
        err.message?.includes('Network Error') ||
        !err.response;

      if (isNetworkError) {
        // Mock register when backend is down
        const mockToken = 'mock-jwt-' + Date.now();
        const userData = {
          id: 'user-' + Date.now(),
          username,
          email,
          role: 'User',
          isEmailVerified: false,
        };
        saveSession(mockToken, userData, setToken, setUser);
        return { ...userData, message: 'Mã OTP: 123456 (demo mode)' };
      }

      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.response?.data ||
        'Đăng ký thất bại. Vui lòng thử lại.';
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  /**
   * Verify OTP — complete email verification
   */
  const verifyOtp = async (email, otp) => {
    try {
      await authApi.verifyOtp({ email, otp });
      // Update local user state
      const updated = { ...user, isEmailVerified: true };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      return true;
    } catch (err) {
      // Mock mode
      if (err.code === 'ERR_NETWORK' || !err.response) {
        if (otp === '123456') {
          const updated = { ...user, isEmailVerified: true };
          setUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
          return true;
        }
        throw new Error('Mã OTP không đúng!');
      }
      const message = err.response?.data?.message || err.response?.data || 'OTP không hợp lệ';
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  /**
   * Resend OTP
   */
  const resendOtp = async (email) => {
    try {
      await authApi.resendOtp({ email });
      return true;
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        return true; // Mock: always succeed
      }
      throw new Error(err.response?.data?.message || 'Gửi lại OTP thất bại');
    }
  };

  /**
   * Social Logins — redirect to backend OAuth endpoint
   */
  const loginWithGoogle = () => {
    window.location.href = `${API_BASE.replace('/api', '')}/api/oauth/google-login`;
  };
  const loginWithFacebook = () => {
    window.location.href = `${API_BASE.replace('/api', '')}/api/oauth/facebook-login`;
  };
  const loginWithMicrosoft = () => {
    window.location.href = `${API_BASE.replace('/api', '')}/api/oauth/microsoft-login`;
  };

  /**
   * Handle OAuth callback — parse JWT from redirect URL
   */
  const handleOAuthCallback = (jwtToken) => {
    const decoded = decodeJwtPayload(jwtToken);
    if (decoded) {
      saveSession(jwtToken, { ...decoded, isEmailVerified: true }, setToken, setUser);
    }
  };

  /**
   * Phone Verification — in Profile page
   */
  const verifyPhone = async (phone, otp) => {
    try {
      await authApi.verifyPhone({ phone, otp });
      const updated = { ...user, phoneVerified: true, phone };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      return true;
    } catch (err) {
      // Mock mode
      if (err.code === 'ERR_NETWORK' || !err.response) {
        const updated = { ...user, phoneVerified: true, phone };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        return true;
      }
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const isAdmin = user?.role === 'Admin';
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user, token, loading,
        login, register, logout, updateProfile,
        loginWithMicrosoft, loginWithGoogle, loginWithFacebook,
        handleOAuthCallback,
        verifyOtp, resendOtp, verifyPhone,
        isAdmin, isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
