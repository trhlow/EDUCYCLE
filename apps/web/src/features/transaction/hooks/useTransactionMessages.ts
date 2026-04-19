import { useQuery } from '@tanstack/react-query';
import { messagesApi } from '../api';
import { queryKeys } from '../../../lib/query-keys';
import { messageSchema } from '../schemas';

export const upsertMessage = <T extends { id?: string | number }>(
  previous: T[] | undefined,
  incoming: T,
) => {
  const current = Array.isArray(previous) ? previous : [];
  const incomingId = incoming.id == null ? null : String(incoming.id);
  if (incomingId != null && current.some((item) => String(item.id) === incomingId)) {
    return current;
  }
  return [...current, incoming];
};

export const useTransactionMessages = (
  transactionId: string | number | undefined,
  options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
  },
) =>
  useQuery({
    queryKey: queryKeys.transactions.messages(transactionId ?? 'unknown'),
    queryFn: async () => {
      const response = await messagesApi.getByTransaction(String(transactionId));
      const raw = Array.isArray(response.data) ? response.data : [];
      return raw.map((item) => messageSchema.parse(item));
    },
    enabled: Boolean(transactionId) && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval ?? false,
    placeholderData: (previous) => previous,
  });



