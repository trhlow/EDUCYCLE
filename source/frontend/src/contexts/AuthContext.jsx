import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi, usersApi } from '../api/endpoints';
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

/** Map GET/PATCH /users/me → shape FE dùng trong Context */
function mapMeResponse(data) {
  return {
    id: data.userId,
    username: data.username,
    email: data.email,
    role: data.role || 'USER',
    emailVerified: data.emailVerified ?? false,
    phoneVerified: data.phoneVerified ?? false,
    phone: data.phone ?? null,
    bio: data.bio ?? '',
    avatar: data.avatar ?? null,
    notifyProductModeration: data.notifyProductModeration ?? true,
    notifyTransactions: data.notifyTransactions ?? true,
    notifyMessages: data.notifyMessages ?? true,
    transactionRulesAcceptedAt: data.transactionRulesAcceptedAt ?? null,
    tradingAllowed: data.tradingAllowed !== false,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadAuthSession());
  const { user, token } = session;

  // Giữ token trong React khớp localStorage sau silent refresh (axios interceptor)
  useEffect(() => {
    const onTokenRefreshed = (e) => {
      const newToken = e.detail?.token;
      if (!newToken || typeof newToken !== 'string') return;
      setSession((s) => {
        if (!s.user || !s.token) return s;
        localStorage.setItem('token', newToken);
        return { ...s, token: newToken };
      });
    };
    window.addEventListener('educycle:token-refreshed', onTokenRefreshed);
    return () => window.removeEventListener('educycle:token-refreshed', onTokenRefreshed);
  }, []);

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
        emailVerified: data.emailVerified ?? false,
        phoneVerified: data.phoneVerified ?? false,
        phone: data.phone ?? null,
        bio: '',
        avatar: null,
        tradingAllowed: data.tradingAllowed !== false,
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
      return {
        email: data.email ?? email,
        username: data.username ?? username,
        message: data.message ?? 'Vui lòng kiểm tra email để xác thực OTP.',
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

  const verifyOtp = async (email, otpCode) => {
    if (!email || !otpCode) throw new Error('Email và mã OTP là bắt buộc');
    try {
      const res = await authApi.verifyOtp({ email, otp: otpCode });
      const data = res.data;
      const userData = {
        id: data.userId,
        username: data.username,
        email: data.email,
        role: data.role || 'USER',
        emailVerified: data.emailVerified ?? true,
        phoneVerified: data.phoneVerified ?? false,
        phone: data.phone ?? null,
        bio: '',
        avatar: null,
        tradingAllowed: data.tradingAllowed !== false,
      };
      applySession(userData, data.token, data.refreshToken || null);
      return userData;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        (err.code === 'ERR_NETWORK' ? 'Không thể kết nối server.' : null) ||
        err.response?.data ||
        'Mã OTP không đúng hoặc đã hết hạn.';
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  const resendOtp = async (email) => {
    if (!email) throw new Error('Email là bắt buộc');
    const res = await authApi.resendOtp({ email });
    return res.data;
  };

  const verifyPhone = async (phoneNumber) => {
    if (!phoneNumber) throw new Error('Số điện thoại là bắt buộc');
    const res = await authApi.verifyPhone({ phone: phoneNumber });
    updateProfile({ phone: phoneNumber, phoneVerified: true });
    return res.data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await authApi.logout({ refreshToken });
      } catch {
        /* best-effort */
      }
    }
    clearAuthStorage();
    setSession({ user: null, token: null });
  };

  /** Merge cục bộ (OTP, phone) — dùng functional update tránh stale closure */
  const updateProfile = (updates) => {
    setSession((s) => {
      if (!s.user) return s;
      const updated = { ...s.user, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return { ...s, user: updated };
    });
  };

  /** Đồng bộ đầy đủ từ BE sau khi đăng nhập hoặc vào trang hồ sơ */
  const refreshUser = useCallback(async () => {
    const res = await usersApi.getMe();
    const nextUser = mapMeResponse(res.data);
    setSession((s) => {
      if (!s.token) return s;
      const rt = localStorage.getItem('refreshToken');
      persistSession(nextUser, s.token, rt);
      return { user: nextUser, token: s.token };
    });
    return nextUser;
  }, []);

  /** Lưu hồ sơ lên server (PATCH /users/me) */
  const saveProfileToServer = useCallback(async ({ username, bio, avatar }) => {
    const res = await usersApi.patchMe({
      username,
      bio: bio ?? null,
      avatar: avatar ?? null,
    });
    const nextUser = mapMeResponse(res.data);
    setSession((s) => {
      if (!s.token) return s;
      const rt = localStorage.getItem('refreshToken');
      persistSession(nextUser, s.token, rt);
      return { user: nextUser, token: s.token };
    });
    return nextUser;
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    await authApi.changePassword({ currentPassword, newPassword });
  }, []);

  /** Sprint 3: PATCH /users/me/notification-preferences */
  const saveNotificationPrefsToServer = useCallback(
    async ({ notifyProductModeration, notifyTransactions, notifyMessages }) => {
      const res = await usersApi.patchNotificationPrefs({
        notifyProductModeration,
        notifyTransactions,
        notifyMessages,
      });
      const nextUser = mapMeResponse(res.data);
      setSession((s) => {
        if (!s.token) return s;
        const rt = localStorage.getItem('refreshToken');
        persistSession(nextUser, s.token, rt);
        return { user: nextUser, token: s.token };
      });
      return nextUser;
    },
    [],
  );

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
        logout,
        updateProfile,
        refreshUser,
        saveProfileToServer,
        changePassword,
        saveNotificationPrefsToServer,
        verifyOtp,
        resendOtp,
        verifyPhone,
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong AuthProvider');
  return ctx;
}
