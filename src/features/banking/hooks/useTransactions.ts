import { useQuery } from "@tanstack/react-query";
import {
  fetchRecentTransactions,
  fetchMonthlySummary,
} from "@/features/banking/services/transactionService";

export function useTransactions(accountId: string | undefined, limit = 10) {
  return useQuery({
    queryKey: ["transactions", accountId, limit],
    queryFn: () => fetchRecentTransactions(accountId!, limit),
    enabled: !!accountId,
  });
}

export function useMonthlySummary(accountId: string | undefined) {
  return useQuery({
    queryKey: ["monthly-summary", accountId],
    queryFn: () => fetchMonthlySummary(accountId!),
    enabled: !!accountId,
  });
}
