import api from './axios';

// ─── Auth ────────────────────────────────────────────
export const authApi = {
  register:        (data) => api.post('/auth/register', data),
  login:           (data) => api.post('/auth/login', data),
  refresh:         (data) => api.post('/auth/refresh', data),
  logout:          (data) => api.post('/auth/logout', data),
  verifyOtp:       (data) => api.post('/auth/verify-otp', data),
  resendOtp:       (data) => api.post('/auth/resend-otp', data),
  socialLogin:     (data) => api.post('/auth/social-login', data),
  verifyPhone:     (data) => api.post('/auth/verify-phone', data),
  // Issue: Forgot / Reset password
  forgotPassword:  (data) => api.post('/auth/forgot-password', data),
  resetPassword:   (data) => api.post('/auth/reset-password', data),
};

// ─── Products ────────────────────────────────────────
export const productsApi = {
  getAll:         (params) => api.get('/products', { params }),
  getById:        (id)     => api.get(`/products/${id}`),
  create:         (data)   => api.post('/products', data),
  update:         (id, data) => api.put(`/products/${id}`, data),
  delete:         (id)     => api.delete(`/products/${id}`),
  getMyProducts:  ()       => api.get('/products/mine'),
  // Admin
  getPending:     ()       => api.get('/products/pending'),
  getAllForAdmin:  ()       => api.get('/products/admin/all'),
  approve:        (id)     => api.patch(`/products/${id}/approve`),
  reject:         (id)     => api.patch(`/products/${id}/reject`),
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
  generateOtp:      (id)      => api.post(`/transactions/${id}/otp`),
  verifyOtp:        (id,data) => api.post(`/transactions/${id}/verify-otp`, data),
  confirmReceipt:   (id)      => api.post(`/transactions/${id}/confirm`),
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
};
