import { useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '../../../api/endpoints';
import { queryKeys } from '../../../lib/query/queryKeys';
import { messageSchema, type MessageDTO } from '../../../lib/schemas/entities';
import { upsertMessage } from './useTransactionMessages';

type SendMessageInput = {
  content: string;
  senderId?: string | number | null;
  senderName?: string | null;
};

type OptimisticContext = {
  previous: MessageDTO[] | undefined;
};

export const useSendTransactionMessage = (transactionId: string | number | undefined) => {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.transactions.messages(transactionId ?? 'unknown');

  return useMutation<MessageDTO, unknown, SendMessageInput, OptimisticContext>({
    mutationFn: async ({ content }) => {
      const response = await messagesApi.send(String(transactionId), { content });
      return messageSchema.parse(response.data);
    },
    onMutate: async ({ content, senderId, senderName }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MessageDTO[]>(queryKey);
      const optimisticMessage = messageSchema.parse({
        id: `optimistic-${Date.now()}`,
        transactionId: String(transactionId),
        senderId: senderId ?? 'unknown',
        senderName: senderName ?? 'Bạn',
        content,
        createdAt: new Date().toISOString(),
      });

      queryClient.setQueryData<MessageDTO[]>(queryKey, (current) => upsertMessage(current, optimisticMessage));
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSuccess: (savedMessage) => {
      queryClient.setQueryData<MessageDTO[]>(queryKey, (current) => upsertMessage(current, savedMessage));
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });
};
