import { useQuery } from '@tanstack/react-query';
import { mediaApi } from '../api/endpoints';
import { queryKeys } from '../lib/query/queryKeys';
import { unsplashCuratedSchema, type UnsplashCuratedResponse } from '../lib/schemas/entities';

type UnsplashOrientation = 'landscape' | 'portrait';

type UseUnsplashCuratedOptions = {
  topic?: string;
  orientation?: UnsplashOrientation;
  count?: number;
  enabled?: boolean;
};

export function useUnsplashCurated({
  topic = 'study',
  orientation = 'landscape',
  count = 6,
  enabled = true,
}: UseUnsplashCuratedOptions = {}) {
  return useQuery<UnsplashCuratedResponse>({
    queryKey: queryKeys.media.unsplashCurated(topic, orientation, count),
    queryFn: async () => {
      const response = await mediaApi.getUnsplashCurated({ topic, orientation, count });
      return unsplashCuratedSchema.parse(response.data);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
