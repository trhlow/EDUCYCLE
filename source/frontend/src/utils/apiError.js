/**
 * Chuẩn hoá thông báo lỗi từ Axios / Spring Boot (`message`, `title`, validation `errors`).
 * Dùng trong catch: `toast.error(getApiErrorMessage(err, 'Thất bại mặc định'))`
 */
export function getApiErrorMessage(error, fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.') {
  if (!error) return fallback;
  if (typeof error === 'string') return error;

  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Không kết nối được máy chủ. Kiểm tra mạng hoặc API đang chạy.';
  }

  const status = error.response?.status;
  const data = error.response?.data;

  if (status === 401) {
    return 'Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.';
  }
  if (status === 403) {
    return typeof data?.message === 'string' ? data.message : 'Bạn không có quyền thực hiện thao tác này.';
  }
  if (status === 404) {
    return typeof data?.message === 'string' ? data.message : 'Không tìm thấy dữ liệu.';
  }
  if (status === 409) {
    return typeof data?.message === 'string' ? data.message : 'Dữ liệu xung đột hoặc trùng.';
  }
  if (status === 422 || status === 400) {
    if (Array.isArray(data?.errors) && data.errors.length) {
      return data.errors.join(' · ');
    }
  }
  if (status === 429) {
    return 'Quá nhiều yêu cầu. Vui lòng đợi vài giây rồi thử lại.';
  }
  if (status >= 500) {
    return 'Máy chủ đang bận hoặc gặp sự cố. Thử lại sau.';
  }

  const msg = data?.message ?? data?.title ?? data?.error;
  if (typeof msg === 'string' && msg.trim()) return msg.trim();
  if (typeof error.message === 'string' && error.message !== 'Request failed with status code') {
    return error.message;
  }

  return fallback;
}
