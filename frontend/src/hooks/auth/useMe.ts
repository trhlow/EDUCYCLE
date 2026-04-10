import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../api/endpoints';
import { queryKeys } from '../../services/query/queryKeys';
import { userSchema } from '../../services/schemas/entities';

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



