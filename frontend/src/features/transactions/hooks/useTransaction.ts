import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../../../api/endpoints';
import { queryKeys } from '../../../lib/query/queryKeys';
import { transactionSchema } from '../../../lib/schemas/entities';

export const useTransaction = (id: string | number | undefined) =>
  useQuery({
    queryKey: queryKeys.transactions.detail(id ?? 'unknown'),
    queryFn: async () => {
      const response = await transactionsApi.getById(String(id));
      return transactionSchema.parse(response.data);
    },
    enabled: Boolean(id),
    staleTime: 15_000,
  });
