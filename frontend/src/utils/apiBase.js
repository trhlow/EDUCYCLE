/**
 * Axios baseURL for REST. Dev default `/api` → Vite proxy → Spring.
 * Absolute URLs get `/api` if missing. Relative values get a leading `/` (e.g. `api` → `/api`).
 */
export const resolveApiBaseUrl = () => {
  const raw = import.meta.env.VITE_API_URL;
  if (raw == null || String(raw).trim() === '') {
    return '/api';
  }
  let s = String(raw).trim().replace(/\/+$/, '');
  if (s.startsWith('http://') || s.startsWith('https://')) {
    return s.endsWith('/api') ? s : `${s}/api`;
  }
  if (!s.startsWith('/')) {
    s = `/${s}`;
  }
  if (s === '/') {
    return '/api';
  }
  return s.endsWith('/api') ? s : `${s}/api`;
};

/**
 * Origin for SockJS `/ws`. Empty string = same origin as the page (Vite proxy in dev).
 */
export const resolveWsOrigin = () => {
  const base = resolveApiBaseUrl();
  if (base.startsWith('/')) {
    return '';
  }
  return base.replace(/\/api\/?$/, '');
};
