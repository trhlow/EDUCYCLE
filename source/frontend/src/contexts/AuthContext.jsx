import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

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
      const userData = data.user || {
        id: data.id || data.userId,
        username: data.username || data.userName || email.split('@')[0],
        email: data.email || email,
        role: data.role || 'User',
        avatar: data.avatar || null,
        bio: data.bio || '',
      };

      saveSession(jwt, userData, setToken, setUser);
      return userData;
    } catch (err) {
      // If backend is unreachable → try mock accounts
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

      if (data.token) {
        const jwt = data.token;
        const userData = data.user || {
          id: data.id || data.userId,
          username: data.username || data.userName || username,
          email: data.email || email,
          role: data.role || 'User',
          avatar: null,
          bio: '',
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

      if (isNetworkError) {
        // Mock register when backend is down
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
