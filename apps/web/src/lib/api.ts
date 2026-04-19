import type { AxiosResponse } from 'axios';
import api from './api-client';
import { resolveApiBaseUrl } from './api-base';
import type {
  CategoryDTO,
  MessageDTO,
  NotificationDTO,
  ProductDTO,
  PublicHealthDTO,
  PublicProfileDTO,
  ReviewDTO,
  TransactionDTO,
  UnsplashCuratedResponse,
  UserDTO,
} from './entity-schemas';
import type { AuthResponseDTO } from './api-schemas';

export type Id = string | number;
export type ApiParams = Record<string, string | number | boolean | null | undefined>;
export type ApiList<T> = T[] | { items?: T[]; content?: T[] };

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = LoginRequest & {
  username: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type VerifyOtpRequest = {
  email?: string;
  otp?: string;
};

export type VerifyPhoneRequest = {
  phone: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token?: string;
  resetToken?: string;
  password?: string;
  newPassword?: string;
};

export type UserProfilePatchRequest = Partial<Pick<UserDTO, 'username' | 'bio' | 'avatar'>>;

export type NotificationPrefsPatchRequest = Partial<
  Pick<UserDTO, 'notifyProductModeration' | 'notifyTransactions' | 'notifyMessages'>
>;

export type ProductWriteRequest = {
  name?: string;
  category?: string;
  categoryId?: number;
  condition?: string;
  price?: number;
  priceType?: string;
  description?: string;
  contactNote?: string;
  imageUrl?: string;
  imageUrls?: string[];
};

export type RejectProductRequest = {
  reason?: string;
};

export type CategoryWriteRequest = {
  name?: string;
  description?: string;
};

export type CreateTransactionRequest = {
  productId: Id;
  sellerId?: Id;
  amount?: number;
};

export type UpdateTransactionStatusRequest = {
  status: string;
};

export type CancelTransactionRequest = {
  reason?: string;
};

export type VerifyTransactionOtpRequest = {
  otp: string;
};

export type TransactionDisputeRequest = {
  reason?: string;
};

export type SendMessageRequest = {
  content: string;
};

export type CreateReviewRequest = {
  transactionId?: Id;
  revieweeId?: Id;
  rating: number;
  content: string;
};

export type AdminUserWriteRequest = Partial<UserDTO> & {
  password?: string;
};

export type ResolveDisputeRequest = {
  resolution: string;
  adminNote?: string;
};

export type AiChatRequest = {
  messages: Array<{ role: string; content: string }>;
};

export type AiChatResponse = {
  reply?: string;
};

export type UploadProductImageResponse = {
  url: string;
};

export const authApi = {
  register: (data: RegisterRequest): Promise<AxiosResponse<AuthResponseDTO>> =>
    api.post('/auth/register', data),
  login: (data: LoginRequest): Promise<AxiosResponse<AuthResponseDTO>> =>
    api.post('/auth/login', data),
  refresh: (data: RefreshTokenRequest): Promise<AxiosResponse<AuthResponseDTO>> =>
    api.post('/auth/refresh', data),
  logout: (data: RefreshTokenRequest): Promise<AxiosResponse<unknown>> =>
    api.post('/auth/logout', data),
  verifyOtp: (data: VerifyOtpRequest): Promise<AxiosResponse<AuthResponseDTO>> =>
    api.post('/auth/verify-otp', data),
  resendOtp: (data: ForgotPasswordRequest): Promise<AxiosResponse<{ message?: string }>> =>
    api.post('/auth/resend-otp', data),
  verifyPhone: (data: VerifyPhoneRequest): Promise<AxiosResponse<unknown>> =>
    api.post('/auth/verify-phone', data),
  changePassword: (data: ChangePasswordRequest): Promise<AxiosResponse<unknown>> =>
    api.post('/auth/change-password', data),
  forgotPassword: (data: ForgotPasswordRequest): Promise<AxiosResponse<{ message?: string }>> =>
    api.post('/auth/forgot-password', data),
  resetPassword: (data: ResetPasswordRequest): Promise<AxiosResponse<{ message?: string }>> =>
    api.post('/auth/reset-password', data),
};

export const usersApi = {
  getMe: (): Promise<AxiosResponse<UserDTO>> => api.get('/users/me'),
  patchMe: (data: UserProfilePatchRequest): Promise<AxiosResponse<UserDTO>> =>
    api.patch('/users/me', data),
  patchNotificationPrefs: (
    data: NotificationPrefsPatchRequest,
  ): Promise<AxiosResponse<UserDTO>> =>
    api.patch('/users/me/notification-preferences', data),
  acceptTransactionRules: (): Promise<AxiosResponse<unknown>> =>
    api.post('/users/me/accept-transaction-rules'),
};

export const productsApi = {
  getAll: (params?: ApiParams): Promise<AxiosResponse<ApiList<ProductDTO>>> =>
    api.get('/products', { params }),
  getById: (id: Id): Promise<AxiosResponse<ProductDTO>> => api.get(`/products/${id}`),
  create: (data: ProductWriteRequest): Promise<AxiosResponse<ProductDTO>> =>
    api.post('/products', data),
  update: (id: Id, data: ProductWriteRequest): Promise<AxiosResponse<ProductDTO>> =>
    api.put(`/products/${id}`, data),
  delete: (id: Id): Promise<AxiosResponse<unknown>> => api.delete(`/products/${id}`),
  getMyProducts: (params?: ApiParams): Promise<AxiosResponse<ApiList<ProductDTO>>> =>
    api.get('/products/mine', { params }),
  getPending: (): Promise<AxiosResponse<ApiList<ProductDTO>>> => api.get('/products/pending'),
  getAllForAdmin: (): Promise<AxiosResponse<ApiList<ProductDTO>>> =>
    api.get('/products/admin/all'),
  approve: (id: Id): Promise<AxiosResponse<ProductDTO>> => api.patch(`/products/${id}/approve`),
  reject: (id: Id, data?: RejectProductRequest): Promise<AxiosResponse<ProductDTO>> =>
    api.patch(`/products/${id}/reject`, data ?? {}),
};

export const categoriesApi = {
  getAll: (): Promise<AxiosResponse<CategoryDTO[]>> => api.get('/categories'),
  getById: (id: Id): Promise<AxiosResponse<CategoryDTO>> => api.get(`/categories/${id}`),
  create: (data: CategoryWriteRequest): Promise<AxiosResponse<CategoryDTO>> =>
    api.post('/categories', data),
  update: (id: Id, data: CategoryWriteRequest): Promise<AxiosResponse<CategoryDTO>> =>
    api.put(`/categories/${id}`, data),
  delete: (id: Id): Promise<AxiosResponse<unknown>> => api.delete(`/categories/${id}`),
};

export const transactionsApi = {
  getAll: (): Promise<AxiosResponse<TransactionDTO[]>> => api.get('/transactions'),
  getMyTransactions: (): Promise<AxiosResponse<TransactionDTO[]>> =>
    api.get('/transactions/mine'),
  getById: (id: Id): Promise<AxiosResponse<TransactionDTO>> => api.get(`/transactions/${id}`),
  create: (data: CreateTransactionRequest): Promise<AxiosResponse<TransactionDTO>> =>
    api.post('/transactions', data),
  updateStatus: (
    id: Id,
    data: UpdateTransactionStatusRequest,
  ): Promise<AxiosResponse<TransactionDTO>> => api.patch(`/transactions/${id}/status`, data),
  cancel: (id: Id, data?: CancelTransactionRequest): Promise<AxiosResponse<TransactionDTO>> =>
    api.post(`/transactions/${id}/cancel`, data ?? {}),
  generateOtp: (id: Id): Promise<AxiosResponse<{ otp?: string }>> =>
    api.post(`/transactions/${id}/otp`),
  verifyOtp: (id: Id, data: VerifyTransactionOtpRequest): Promise<AxiosResponse<unknown>> =>
    api.post(`/transactions/${id}/verify-otp`, data),
  confirmReceipt: (id: Id): Promise<AxiosResponse<TransactionDTO>> =>
    api.post(`/transactions/${id}/confirm`),
  openDispute: (
    id: Id,
    data?: TransactionDisputeRequest,
  ): Promise<AxiosResponse<TransactionDTO>> => api.post(`/transactions/${id}/dispute`, data ?? {}),
};

export const messagesApi = {
  getByTransaction: (txId: Id): Promise<AxiosResponse<MessageDTO[]>> =>
    api.get(`/transactions/${txId}/messages`),
  send: (txId: Id, data: SendMessageRequest): Promise<AxiosResponse<MessageDTO>> =>
    api.post(`/transactions/${txId}/messages`, data),
};

export const reviewsApi = {
  getAll: (): Promise<AxiosResponse<ReviewDTO[]>> => api.get('/reviews'),
  getById: (id: Id): Promise<AxiosResponse<ReviewDTO>> => api.get(`/reviews/${id}`),
  create: (data: CreateReviewRequest): Promise<AxiosResponse<ReviewDTO>> =>
    api.post('/reviews', data),
  delete: (id: Id): Promise<AxiosResponse<unknown>> => api.delete(`/reviews/${id}`),
  getByTransaction: (txId: Id): Promise<AxiosResponse<ReviewDTO[]>> =>
    api.get(`/reviews/transaction/${txId}`),
  getByProduct: (pid: Id): Promise<AxiosResponse<ReviewDTO[]>> =>
    api.get(`/reviews/product/${pid}`),
  getByUser: (uid: Id): Promise<AxiosResponse<ReviewDTO[]>> => api.get(`/reviews/user/${uid}`),
};

export const notificationsApi = {
  getRecent: (): Promise<AxiosResponse<NotificationDTO[]>> => api.get('/notifications'),
  getUnreadCount: (): Promise<AxiosResponse<{ count?: number }>> =>
    api.get('/notifications/unread-count'),
  markAsRead: (id: Id): Promise<AxiosResponse<unknown>> =>
    api.patch(`/notifications/${id}/read`),
  markAllAsRead: (): Promise<AxiosResponse<unknown>> => api.patch('/notifications/read-all'),
};

export const adminApi = {
  getStats: (): Promise<AxiosResponse<unknown>> => api.get('/admin/stats'),
  getUsers: (): Promise<AxiosResponse<UserDTO[]>> => api.get('/admin/users'),
  getUser: (id: Id): Promise<AxiosResponse<UserDTO>> => api.get(`/admin/users/${id}`),
  createUser: (data: AdminUserWriteRequest): Promise<AxiosResponse<UserDTO>> =>
    api.post('/admin/users', data),
  updateUser: (id: Id, data: AdminUserWriteRequest): Promise<AxiosResponse<UserDTO>> =>
    api.patch(`/admin/users/${id}`, data),
  getDisputedTransactions: (): Promise<AxiosResponse<TransactionDTO[]>> =>
    api.get('/admin/transactions/disputed'),
  resolveDisputedTransaction: (
    id: Id,
    data: ResolveDisputeRequest,
  ): Promise<AxiosResponse<TransactionDTO>> => api.patch(`/admin/transactions/${id}/resolve`, data),
};

export const publicProfileApi = {
  getUser: (userId: Id): Promise<AxiosResponse<PublicProfileDTO>> =>
    api.get(`/public/users/${userId}`),
};

export const wishlistApi = {
  getAll: (): Promise<AxiosResponse<ProductDTO[]>> => api.get('/wishlist'),
  add: (productId: Id): Promise<AxiosResponse<unknown>> => api.post(`/wishlist/${productId}`),
  remove: (productId: Id): Promise<AxiosResponse<unknown>> =>
    api.delete(`/wishlist/${productId}`),
};

export const aiApi = {
  chat: (data: AiChatRequest): Promise<AxiosResponse<AiChatResponse>> =>
    api.post('/ai/chat', data),
};

export const mediaApi = {
  getUnsplashCurated: (
    params: ApiParams,
  ): Promise<AxiosResponse<UnsplashCuratedResponse>> =>
    api.get('/media/unsplash/curated', { params }),
};

export const publicApi = {
  health: (): Promise<AxiosResponse<PublicHealthDTO>> => api.get('/public/health'),
};

export async function uploadProductImage(file: File): Promise<UploadProductImageResponse> {
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
      const json = (await res.json()) as { message?: unknown; error?: unknown };
      msg = String(json.message || json.error || msg);
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return (await res.json()) as UploadProductImageResponse;
}
