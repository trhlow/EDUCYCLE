import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

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
   * Login via real backend API
   * POST /api/auth/login  { email, password }
   * Expected response: { token, user } or { token, ...userData }
   */
  const login = async (email, password) => {
    if (!email || !password) throw new Error('Email và mật khẩu là bắt buộc');

    try {
      const res = await authApi.login({ email, password });
      const data = res.data;

      // Backend may return { token, user } or { token, ...fields }
      const jwt = data.token;
      const userData = data.user || {
        id: data.id || data.userId,
        username: data.username || data.userName || email.split('@')[0],
        email: data.email || email,
        role: data.role || 'User',
        avatar: data.avatar || null,
        bio: data.bio || '',
      };

      localStorage.setItem('token', jwt);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(jwt);
      setUser(userData);
      return userData;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.response?.data ||
        'Đăng nhập thất bại. Kiểm tra lại email và mật khẩu.';
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  /**
   * Register via real backend API
   * POST /api/auth/register  { username, email, password }
   */
  const register = async (username, email, password) => {
    if (!username || !email || !password) throw new Error('Tất cả các trường là bắt buộc');

    try {
      const res = await authApi.register({ username, email, password });
      const data = res.data;

      // If backend returns token after register → auto-login
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

        localStorage.setItem('token', jwt);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(jwt);
        setUser(userData);
        return userData;
      }

      // If no token returned, backend may require separate login
      // Auto-login after registration
      return await login(email, password);
    } catch (err) {
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
