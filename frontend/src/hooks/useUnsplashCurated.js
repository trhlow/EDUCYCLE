import { useQuery } from '@tanstack/react-query';
import { mediaApi } from '../api/endpoints';

export function useUnsplashCurated({
  topic = 'study',
  orientation = 'landscape',
  count = 6,
  enabled = true,
} = {}) {
  return useQuery({
    queryKey: ['media', 'unsplash', 'curated', topic, orientation, count],
    queryFn: async () => {
      const res = await mediaApi.getUnsplashCurated({ topic, orientation, count });
      return res.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
