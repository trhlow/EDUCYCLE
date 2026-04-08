import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../../../api/endpoints';
import { queryKeys } from '../../../lib/query/queryKeys';

type VerifyOtpInput = {
  otp: string;
};

export const useGenerateTransactionOtp = (transactionId: string | number | undefined) =>
  useMutation({
    mutationFn: async () => {
      const response = await transactionsApi.generateOtp(String(transactionId));
      const value = response.data?.otp;
      return typeof value === 'string' ? value : '';
    },
  });

export const useVerifyTransactionOtp = (transactionId: string | number | undefined) => {
  const queryClient = useQueryClient();
  const transactionKey = queryKeys.transactions.detail(transactionId ?? 'unknown');

  return useMutation({
    mutationFn: async (input: VerifyOtpInput) => {
      await transactionsApi.verifyOtp(String(transactionId), input);
      return true;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: transactionKey });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.transactions.messages(transactionId ?? 'unknown'),
      });
    },
  });
};
