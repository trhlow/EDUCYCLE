import axios from 'axios';
import { clearAuthStorage } from '../utils/safeSession';
import { resolveApiBaseUrl } from '../utils/apiBase';
import { getApiErrorMessage } from '../utils/apiError';
import { parseAuthResponse } from './schemas';

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Silent refresh (MODULE 1) — use root axios for /auth/refresh to avoid interceptor loop ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

const validateAuthJsonIfNeeded = (response) => {
  const url = response.config?.url ?? '';
  if (!url.includes('/auth/') || !response.data || typeof response.data !== 'object') return;
  if (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/verify-otp')
  ) {
    parseAuthResponse(response.data, url);
  }
};

api.interceptors.response.use(
  (response) => {
    validateAuthJsonIfNeeded(response);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        delete api.defaults.headers.common.Authorization;
        clearAuthStorage();
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        parseAuthResponse(res.data, '/auth/refresh');
        const { token: newToken, refreshToken: newRefreshToken } = res.data;

        localStorage.setItem('token', newToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        // Cho WebSocket / trang cần JWT mới (AuthContext state có thể chưa sync)
        window.dispatchEvent(
          new CustomEvent('educycle:token-refreshed', { detail: { token: newToken } }),
        );
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        delete api.defaults.headers.common.Authorization;
        clearAuthStorage();
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const enriched = error;
    enriched.userFacingMessage = getApiErrorMessage(error);
    return Promise.reject(enriched);
  }
);

/** Dùng trong test (Vitest) để tránh leak state refresh giữa file. */
export const __resetAxiosRefreshStateForTesting = () => {
  isRefreshing = false;
  failedQueue = [];
};

export default api;
