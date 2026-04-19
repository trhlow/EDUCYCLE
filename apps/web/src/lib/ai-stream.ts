import { resolveApiBaseUrl } from './api-base';

type StreamAiChatArgs = {
  messages: Array<{ role: string; content: string }>;
  signal?: AbortSignal;
  onDelta: (delta: string) => void;
};

type StreamChunk = {
  d?: unknown;
};

export async function streamAiChat({ messages, signal, onDelta }: StreamAiChatArgs) {
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
      const text = await res.text();
      if (text) msg = text.slice(0, 500);
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
        const obj = JSON.parse(payload) as StreamChunk;
        if (typeof obj.d === 'string' && obj.d.length > 0) {
          onDelta(obj.d);
        }
      } catch {
        /* ignore non-JSON stream lines */
      }
    }
  }
}
