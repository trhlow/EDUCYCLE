import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { queryClient } from '../lib/query-client';

type QueryProviderProps = {
  children: ReactNode;
};

/**
 * TanStack Query — entry for incremental migration off useEffect + useState fetching.
 */
export const QueryProvider = ({ children }: QueryProviderProps) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
