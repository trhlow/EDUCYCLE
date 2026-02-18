import api from './axios';

// ─── Auth ────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// ─── Products ────────────────────────────────────────
export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getMyProducts: () => api.get('/products/mine'),
  // Admin
  getPending: () => api.get('/products/pending'),
  getAllForAdmin: () => api.get('/products/admin/all'),
  approve: (id) => api.patch(`/products/${id}/approve`),
  reject: (id) => api.patch(`/products/${id}/reject`),
};

// ─── Categories ──────────────────────────────────────
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ─── Transactions ────────────────────────────────────
// Status flow: Pending → Accepted → Meeting → Completed
//                     → Rejected
//                     → Cancelled
//                     → AutoCompleted (timeout)
export const transactionsApi = {
  getAll: () => api.get('/transactions'),
  getMyTransactions: () => api.get('/transactions/mine'),
  getById: (id) => api.get(`/transactions/${id}`),
  // data = { productId, sellerId, amount }
  create: (data) => api.post('/transactions', data),
  // data = { status: 'Accepted' | 'Rejected' | 'Cancelled' | 'Meeting' }
  updateStatus: (id, data) => api.patch(`/transactions/${id}/status`, data),
  // OTP flow
  generateOtp: (id) => api.post(`/transactions/${id}/otp`),
  verifyOtp: (id, data) => api.post(`/transactions/${id}/verify-otp`, data),
  // Confirm receipt (buyer side)
  confirmReceipt: (id) => api.post(`/transactions/${id}/confirm`),
};

// ─── Messages (Chat nội bộ) ──────────────────────────
export const messagesApi = {
  getByTransaction: (transactionId) =>
    api.get(`/transactions/${transactionId}/messages`),
  send: (transactionId, data) =>
    api.post(`/transactions/${transactionId}/messages`, data),
};

// ─── Reviews (Đánh giá sao) ─────────────────────────
export const reviewsApi = {
  getAll: () => api.get('/reviews'),
  getById: (id) => api.get(`/reviews/${id}`),
  // data = { productId, rating, content } (legacy)
  create: (data) => api.post('/reviews', data),
  delete: (id) => api.delete(`/reviews/${id}`),
  getByTransaction: (transactionId) =>
    api.get(`/reviews/transaction/${transactionId}`),
  getByProduct: (productId) =>
    api.get(`/reviews/product/${productId}`),
  // User-to-user reviews
  getByUser: (userId) => api.get(`/reviews/user/${userId}`),
  // data = { targetUserId, transactionId, rating, content }
  createUserReview: (data) => api.post('/reviews/user', data),
};

// ─── Admin ───────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
};
