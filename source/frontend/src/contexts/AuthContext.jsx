import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const login = async (email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (!email || !password) throw new Error('Email và mật khẩu là bắt buộc');

    const isAdmin = email === 'admin@educycle.com';
    const mockUser = {
      id: isAdmin ? 'admin-1' : 'user-' + Date.now(),
      username: isAdmin ? 'Admin' : email.split('@')[0],
      email,
      role: isAdmin ? 'Admin' : 'User',
      avatar: null,
      bio: '',
      joinDate: new Date().toISOString(),
    };
    const mockToken = 'mock-jwt-' + Date.now();
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setToken(mockToken);
    setUser(mockUser);
    return mockUser;
  };

  const register = async (username, email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (!username || !email || !password) throw new Error('Tất cả các trường là bắt buộc');

    const mockUser = {
      id: 'user-' + Date.now(),
      username,
      email,
      role: 'User',
      avatar: null,
      bio: '',
      joinDate: new Date().toISOString(),
    };
    const mockToken = 'mock-jwt-' + Date.now();
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    setToken(mockToken);
    setUser(mockUser);
    return mockUser;
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
