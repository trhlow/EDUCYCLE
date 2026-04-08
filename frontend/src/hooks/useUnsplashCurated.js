import { useQuery } from '@tanstack/react-query';
import { mediaApi } from '../api/endpoints';
import { queryKeys } from '../lib/query/queryKeys';
import { unsplashCuratedSchema } from '../lib/schemas/entities';

export function useUnsplashCurated({
  topic = 'study',
  orientation = 'landscape',
  count = 6,
  enabled = true,
} = {}) {
  return useQuery({
    queryKey: queryKeys.media.unsplashCurated(topic, orientation, count),
    queryFn: async () => {
      const res = await mediaApi.getUnsplashCurated({ topic, orientation, count });
      return unsplashCuratedSchema.parse(res.data);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
