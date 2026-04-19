import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { clearAuthStorage } from './safe-session';
import { resolveApiBaseUrl } from './api-base';
import { getApiErrorMessage } from './api-error';
import { parseAuthResponse } from './api-schemas';

type FailedQueueItem = {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type EduCycleAxiosError = AxiosError & {
  userFacingMessage?: string;
};

const API_BASE_URL = resolveApiBaseUrl();

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((item) => (error ? item.reject(error) : item.resolve(token)));
  failedQueue = [];
};

const validateAuthJsonIfNeeded = (response: AxiosResponse<unknown>) => {
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
  async (error: EduCycleAxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
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
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((queueError: unknown) => Promise.reject(queueError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post<unknown>(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );
        const parsed = parseAuthResponse(res.data, '/auth/refresh');
        const { token: newToken, refreshToken: newRefreshToken } = parsed;

        localStorage.setItem('token', newToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        window.dispatchEvent(
          new CustomEvent('educycle:token-refreshed', { detail: { token: newToken } }),
        );
        return api(originalRequest);
      } catch (refreshError: unknown) {
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

    error.userFacingMessage = getApiErrorMessage(error);
    return Promise.reject(error);
  },
);

export const __resetAxiosRefreshStateForTesting = () => {
  isRefreshing = false;
  failedQueue = [];
};

export default api;
