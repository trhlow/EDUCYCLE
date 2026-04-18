import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../../lib/api';
import { queryKeys } from '../../lib/query-keys';
import { transactionSchema } from '../../lib/entity-schemas';

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



