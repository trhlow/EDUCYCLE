import { useQuery } from '@tanstack/react-query';
import { mediaApi } from '../lib/api';
import { queryKeys } from '../lib/query-keys';
import { unsplashCuratedSchema, type UnsplashCuratedResponse } from '../lib/entity-schemas';

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

