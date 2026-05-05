import { Box, Typography, Alert, Chip } from "@mui/material";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useAccount } from "@/features/banking/hooks/useAccount";
import {
  useTransactions,
  useMonthlySummary,
} from "@/features/banking/hooks/useTransactions";
import { BalanceCard } from "@/features/dashboard/components/BalanceCard";
import { DashboardStats } from "@/features/dashboard/components/DashboardStats";
import { RecentTransactions } from "@/features/dashboard/components/RecentTransactions";

export function DashboardPage() {
  const { profile } = useAuthStore();

  const {
    data: account,
    isLoading: accountLoading,
    error: accountError,
    refetch: refetchAccount,
  } = useAccount();

  const {
    data: transactions,
    isLoading: txLoading,
    error: txError,
  } = useTransactions(account?.id, 8);

  const { data: summary, isLoading: summaryLoading } = useMonthlySummary(
    account?.id,
  );

  const displayName = profile?.full_name?.split(" ")[0] ?? "there";
  const isAdmin = profile?.role === "admin";

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      {/* Greeting */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Hey, {displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
        </Box>
        {isAdmin && (
          <Chip
            label="Admin"
            color="primary"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        )}
      </Box>

      {accountError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load account data. Please refresh.
        </Alert>
      )}

      {/* Balance Card */}
      <Box sx={{ mb: 3 }}>
        <BalanceCard
          account={account}
          isLoading={accountLoading}
          onRefresh={() => void refetchAccount()}
        />
      </Box>

      {/* Stats row */}
      <Box sx={{ mb: 3 }}>
        <DashboardStats
          income={summary?.income ?? 0}
          expenses={summary?.expenses ?? 0}
          transactionCount={transactions?.length ?? 0}
          isLoading={summaryLoading || txLoading}
        />
      </Box>

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={transactions}
        accountId={account?.id ?? ""}
        isLoading={txLoading}
        error={txError as Error | null}
      />
    </Box>
  );
}
