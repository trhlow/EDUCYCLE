/**
 * Đọc / làm sạch session từ localStorage — tránh crash parse JSON hoặc state lệch token/user.
 */
const KEYS = ['user', 'token', 'refreshToken'];

export function clearAuthStorage() {
  KEYS.forEach((k) => localStorage.removeItem(k));
}

/**
 * @returns {{ user: object | null, token: string | null }}
 */
export function loadAuthSession() {
  try {
    const rawUser = localStorage.getItem('user');
    const rawToken = localStorage.getItem('token');

    let user = null;
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        parsed.id != null &&
        String(parsed.id).length > 0
      ) {
        user = parsed;
      }
    }

    const token = rawToken && String(rawToken).trim() ? rawToken : null;

    if (!user || !token) {
      clearAuthStorage();
      return { user: null, token: null };
    }

    return { user, token };
  } catch {
    clearAuthStorage();
    return { user: null, token: null };
  }
}
