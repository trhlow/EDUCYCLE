import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useUnsplashCurated } from './useUnsplashCurated';
import { mediaApi } from '../lib/api';

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual('../lib/api');
  return {
    ...actual,
    mediaApi: {
      getUnsplashCurated: vi.fn(),
    },
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  return function Wrapper({ children }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useUnsplashCurated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns curated media from backend proxy', async () => {
    mediaApi.getUnsplashCurated.mockResolvedValue({
      data: {
        items: [{ id: 'img-1', urls: { small: 'https://img/small' } }],
        fetchedAt: '2026-04-04T08:00:00Z',
        cacheTtlSeconds: 21600,
      },
    });

    const { result } = renderHook(
      () => useUnsplashCurated({ topic: 'study', orientation: 'landscape', count: 2 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.items).toHaveLength(1);
    expect(mediaApi.getUnsplashCurated).toHaveBeenCalledWith({
      topic: 'study',
      orientation: 'landscape',
      count: 2,
    });
  });

  it('does not call API when disabled', async () => {
    renderHook(
      () => useUnsplashCurated({ enabled: false }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(mediaApi.getUnsplashCurated).not.toHaveBeenCalled());
  });
});
