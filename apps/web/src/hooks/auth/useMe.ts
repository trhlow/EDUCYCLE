import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../lib/api';
import { queryKeys } from '../../lib/query-keys';
import { userSchema } from '../../lib/entity-schemas';

export const useMe = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const response = await usersApi.getMe();
      return userSchema.parse(response.data);
    },
    enabled,
    staleTime: 60_000,
  });



