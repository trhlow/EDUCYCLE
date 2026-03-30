import api from './axios';
import { resolveApiBaseUrl } from '../utils/apiBase';

// ─── Auth ────────────────────────────────────────────
export const authApi = {
  register:        (data) => api.post('/auth/register', data),
  login:           (data) => api.post('/auth/login', data),
  refresh:         (data) => api.post('/auth/refresh', data),
  logout:          (data) => api.post('/auth/logout', data),
  verifyOtp:       (data) => api.post('/auth/verify-otp', data),
  resendOtp:       (data) => api.post('/auth/resend-otp', data),
  verifyPhone:     (data) => api.post('/auth/verify-phone', data),
  changePassword:  (data) => api.post('/auth/change-password', data),
  // Issue: Forgot / Reset password — BE chưa có (Sprint 2)
  forgotPassword:  (data) => api.post('/auth/forgot-password', data),
  resetPassword:   (data) => api.post('/auth/reset-password', data),
};

// ─── Current user (profile) ───────────────────────────
export const usersApi = {
  getMe:    () => api.get('/users/me'),
  patchMe:  (data) => api.patch('/users/me', data),
  patchNotificationPrefs: (data) => api.patch('/users/me/notification-preferences', data),
  /** Lưu chấp nhận nội quy giao dịch trên server */
  acceptTransactionRules: () => api.post('/users/me/accept-transaction-rules'),
};

// ─── Products ────────────────────────────────────────
export const productsApi = {
  getAll:         (params) => api.get('/products', { params }),
  getById:        (id)     => api.get(`/products/${id}`),
  create:         (data)   => api.post('/products', data),
  update:         (id, data) => api.put(`/products/${id}`, data),
  delete:         (id)     => api.delete(`/products/${id}`),
  getMyProducts:  (params) => api.get('/products/mine', { params }),
  // Admin
  getPending:     ()       => api.get('/products/pending'),
  getAllForAdmin:  ()       => api.get('/products/admin/all'),
  approve:        (id)     => api.patch(`/products/${id}/approve`),
  /** @param {object} [data] — optional `{ reason: string }` */
  reject:         (id, data) => api.patch(`/products/${id}/reject`, data ?? {}),
};

// ─── Tin tìm sách (book wanted) ─────────────────────
export const bookWantedApi = {
  list:     (params) => api.get('/book-wanted', { params }),
  listMine: (params) => api.get('/book-wanted/mine', { params }),
  getById:  (id)     => api.get(`/book-wanted/${id}`),
  create:   (data)   => api.post('/book-wanted', data),
  update:   (id, data) => api.patch(`/book-wanted/${id}`, data),
  delete:   (id)     => api.delete(`/book-wanted/${id}`),
};

// ─── Categories ──────────────────────────────────────
export const categoriesApi = {
  getAll:  ()           => api.get('/categories'),
  getById: (id)         => api.get(`/categories/${id}`),
  create:  (data)       => api.post('/categories', data),
  update:  (id, data)   => api.put(`/categories/${id}`, data),
  delete:  (id)         => api.delete(`/categories/${id}`),
};

// ─── Transactions ────────────────────────────────────
export const transactionsApi = {
  getAll:           ()        => api.get('/transactions'),
  getMyTransactions:()        => api.get('/transactions/mine'),
  getById:          (id)      => api.get(`/transactions/${id}`),
  create:           (data)    => api.post('/transactions', data),
  updateStatus:     (id,data) => api.patch(`/transactions/${id}/status`, data),
  /** @param {object} [data] — optional `{ reason?: string }` */
  cancel:           (id, data) => api.post(`/transactions/${id}/cancel`, data ?? {}),
  generateOtp:      (id)      => api.post(`/transactions/${id}/otp`),
  verifyOtp:        (id,data) => api.post(`/transactions/${id}/verify-otp`, data),
  confirmReceipt:   (id)      => api.post(`/transactions/${id}/confirm`),
  openDispute:      (id, data) => api.post(`/transactions/${id}/dispute`, data ?? {}),
};

// ─── Messages ────────────────────────────────────────
export const messagesApi = {
  getByTransaction: (txId)        => api.get(`/transactions/${txId}/messages`),
  send:             (txId, data)  => api.post(`/transactions/${txId}/messages`, data),
};

// ─── Reviews ─────────────────────────────────────────
export const reviewsApi = {
  getAll:           ()      => api.get('/reviews'),
  getById:          (id)    => api.get(`/reviews/${id}`),
  create:           (data)  => api.post('/reviews', data),
  delete:           (id)    => api.delete(`/reviews/${id}`),
  getByTransaction: (txId)  => api.get(`/reviews/transaction/${txId}`),
  getByProduct:     (pid)   => api.get(`/reviews/product/${pid}`),
  getByUser:        (uid)   => api.get(`/reviews/user/${uid}`),
  createUserReview: (data)  => api.post('/reviews', data),
};

// ─── Notifications ───────────────────────────────────
export const notificationsApi = {
  getRecent:      () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead:     (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead:  () => api.patch('/notifications/read-all'),
};

// ─── Admin ───────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getDisputedTransactions: () => api.get('/admin/transactions/disputed'),
  resolveDisputedTransaction: (id, data) => api.patch(`/admin/transactions/${id}/resolve`, data),
};

/** Hồ sơ công khai (không cần đăng nhập) */
export const publicProfileApi = {
  getUser: (userId) => api.get(`/public/users/${userId}`),
};

/** Yêu thích — JWT; đồng bộ server (Flyway V9) */
export const wishlistApi = {
  getAll: () => api.get('/wishlist'),
  add: (productId) => api.post(`/wishlist/${productId}`),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

/** AI chatbot — JWT bắt buộc; key Anthropic chỉ trên BE */
export const aiApi = {
  chat: (data) => api.post('/ai/chat', data),
};

/**
 * Multipart upload — bypass default JSON Content-Type on axios instance.
 * Returns `{ url: "/api/files/<uuid>.ext" }` (relative; use as img src on same origin).
 */
export async function uploadProductImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  const base = resolveApiBaseUrl().replace(/\/+$/, '');
  const res = await fetch(`${base}/upload/product-image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  if (!res.ok) {
    let msg = 'Tải ảnh thất bại';
    try {
      const j = await res.json();
      msg = j.message || j.error || msg;
    } catch {
      /* ignore */
    }
    throw new Error(typeof msg === 'string' ? msg : 'Tải ảnh thất bại');
  }
  return res.json();
}
