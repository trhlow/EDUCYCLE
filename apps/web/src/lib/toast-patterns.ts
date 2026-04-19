export const toastMessages = {
  saved: 'Đã lưu thay đổi.',
  deleted: 'Đã xóa.',
  loaded: 'Dữ liệu đã sẵn sàng.',
  retryableError: 'Không thể hoàn tất thao tác. Vui lòng thử lại.',
  validationError: 'Vui lòng kiểm tra lại thông tin.',
  permissionDenied: 'Bạn chưa có quyền thực hiện thao tác này.',
  authRequired: 'Vui lòng đăng nhập để tiếp tục.',
} as const;

type ApiLikeError = {
  response?: {
    data?: {
      message?: unknown;
      error?: unknown;
      errors?: unknown;
    };
  };
  message?: unknown;
};

export const getToastMessage = (
  error: ApiLikeError | unknown,
  fallback = toastMessages.retryableError,
) => {
  const apiError = error as ApiLikeError;
  const data = apiError?.response?.data;
  const firstError = Array.isArray(data?.errors) ? data.errors[0] : data?.errors;
  const message = data?.message ?? data?.error ?? firstError ?? apiError?.message;

  return typeof message === 'string' && message.trim() ? message : fallback;
};
