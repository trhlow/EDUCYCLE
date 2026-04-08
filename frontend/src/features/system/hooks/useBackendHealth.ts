import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../../api/endpoints';
import { queryKeys } from '../../../lib/query/queryKeys';
import { publicHealthSchema } from '../../../lib/schemas/entities';

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
