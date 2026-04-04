import { resolveApiBaseUrl } from '../utils/apiBase';

/**
 * POST /api/ai/chat/stream — SSE với từng event JSON {@code { d: "chunk" }}.
 * Gọi onDelta cho mỗi đoạn text; onError nếu HTTP lỗi hoặc parse hỏng nghiêm trọng.
 */
export async function streamAiChat({ messages, signal, onDelta }) {
  const base = resolveApiBaseUrl().replace(/\/+$/, '');
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${base}/ai/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages }),
    signal,
    credentials: 'include',
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const t = await res.text();
      if (t) msg = t.slice(0, 500);
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error('Stream không đọc được');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n');
    buffer = parts.pop() ?? '';
    for (const line of parts) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const obj = JSON.parse(payload);
        if (obj && typeof obj.d === 'string' && obj.d.length > 0) {
          onDelta(obj.d);
        }
      } catch {
        /* bỏ qua dòng không phải JSON */
      }
    }
  }
}
