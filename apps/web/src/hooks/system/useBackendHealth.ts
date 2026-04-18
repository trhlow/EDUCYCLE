import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';
import { queryKeys } from '../../lib/query-keys';
import { publicHealthSchema } from '../../lib/entity-schemas';

const ONLINE_REFRESH_MS = 20_000;

export const useBackendHealth = () =>
  useQuery({
    queryKey: queryKeys.system.backendHealth,
    queryFn: async () => {
      const response = await publicApi.health();
      return publicHealthSchema.parse(response.data);
    },
    refetchInterval: ONLINE_REFRESH_MS,
    retry: 0,
    staleTime: 10_000,
  });



