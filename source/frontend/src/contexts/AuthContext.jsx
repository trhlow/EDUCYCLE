import { createContext, useContext, useState } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

// Mock accounts for development/demo (when backend is unavailable)
const MOCK_ACCOUNTS = [
  {
    id: 'admin-001',
    username: 'admin',
    email: 'admin@educycle.com',
    password: 'admin@1',
    role: 'Admin',
  },
];

function saveSession(tokenValue, userData, setToken, setUser) {
  localStorage.setItem('token', tokenValue);
  localStorage.setItem('user', JSON.stringify(userData));
  setToken(tokenValue);
  setUser(userData);
}

export function AuthProvider({ children }) {
  // Restore session from localStorage on initialization
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken && localStorage.getItem('user')) {
      return savedToken;
    }
    localStorage.removeItem('token');
    return null;
  });

  const loading = false;

  /**
   * Login — try real backend first, fall back to mock accounts on network error
   */
  const login = async (email, password) => {
    if (!email || !password) throw new Error('Email và mật khẩu là bắt buộc');

    try {
      const res = await authApi.login({ email, password });
      const data = res.data;
      // Backend AuthResponse: { userId, username, email, token, role }
      const jwt = data.token;
      const userData = {
        id: data.userId,
        username: data.username,
        email: data.email,
        role: data.role || 'User',
      };

      saveSession(jwt, userData, setToken, setUser);
      return userData;
    } catch (err) {
      // If backend is unreachable or broken → try mock accounts
      const isNetworkError =
        err.code === 'ERR_NETWORK' ||
        err.message?.includes('Network Error') ||
        !err.response;
      const isServerError = err.response?.status >= 500;

      if (isNetworkError || isServerError) {
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
          };
          saveSession(mockToken, userData, setToken, setUser);
          return userData;
        }

        // Allow any email/password as regular user when backend is down (dev/demo)
        const mockToken = 'mock-jwt-' + Date.now();
        const userData = {
          id: 'user-' + Date.now(),
          username: email.split('@')[0],
          email,
          role: 'User',
        };
        saveSession(mockToken, userData, setToken, setUser);
        return userData;
      }

      // Backend returned an actual error (e.g. 401)
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.response?.data ||
        'Đăng nhập thất bại. Kiểm tra lại email và mật khẩu.';
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  /**
   * Register — try real backend first, fall back to mock on network error
   */
  const register = async (username, email, password) => {
    if (!username || !email || !password) throw new Error('Tất cả các trường là bắt buộc');

    try {
      const res = await authApi.register({ username, email, password });
      const data = res.data;
      // Backend AuthResponse: { userId, username, email, token, role }
      if (data.token) {
        const jwt = data.token;
        const userData = {
          id: data.userId,
          username: data.username || username,
          email: data.email || email,
          role: data.role || 'User',
        };

        saveSession(jwt, userData, setToken, setUser);
        return userData;
      }

      return await login(email, password);
    } catch (err) {
      const isNetworkError =
        err.code === 'ERR_NETWORK' ||
        err.message?.includes('Network Error') ||
        !err.response;
      const isServerError = err.response?.status >= 500;

      if (isNetworkError || isServerError) {
        // Mock register when backend is down or broken
        const mockToken = 'mock-jwt-' + Date.now();
        const userData = {
          id: 'user-' + Date.now(),
          username,
          email,
          role: 'User',
        };
        saveSession(mockToken, userData, setToken, setUser);
        return userData;
      }

      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.response?.data ||
        'Đăng ký thất bại. Vui lòng thử lại.';
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
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
      value={{ user, token, loading, login, register, logout, updateProfile, isAdmin, isAuthenticated }}
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
