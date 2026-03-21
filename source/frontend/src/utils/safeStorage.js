/**
 * Đọc JSON array từ localStorage — an toàn khi dữ liệu hỏng / không phải array.
 */
export function readStoredArray(key) {
  const saved = localStorage.getItem(key);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(key);
    return [];
  }
}
