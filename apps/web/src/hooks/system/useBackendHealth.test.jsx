import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useBackendHealth } from './useBackendHealth';
import { publicApi } from '../../lib/api';

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual('../../lib/api');
  return {
    ...actual,
    publicApi: {
      health: vi.fn(),
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

describe('useBackendHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses public health payload', async () => {
    publicApi.health.mockResolvedValue({
      data: {
        status: 'UP',
        service: 'educycle-api',
        timestamp: '2026-04-08T04:00:00Z',
      },
    });

    const { result } = renderHook(() => useBackendHealth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.status).toBe('UP');
    expect(publicApi.health).toHaveBeenCalledTimes(1);
  });
});

