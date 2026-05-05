import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  transferFunds,
  type TransferResult,
} from "@/features/banking/services/transactionService";
import { useAuthStore } from "@/features/auth/store/authStore";
import type { TransferParams } from "@/types/banking";

export function useTransfer() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation<TransferResult, Error, TransferParams>({
    mutationFn: (params: TransferParams) => transferFunds(params),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate balance and transactions so dashboard refreshes immediately
        void queryClient.invalidateQueries({ queryKey: ["account", user?.id] });
        void queryClient.invalidateQueries({ queryKey: ["transactions"] });
        void queryClient.invalidateQueries({ queryKey: ["monthly-summary"] });
      }
    },
  });
}
