import { Box, Typography, Paper, Skeleton, Button, Alert } from "@mui/material";
import { ReceiptLongRounded } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { TransactionCard } from "@/features/banking/components/TransactionCard";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/motion/AnimatedList";
import type { Transaction } from "@/types/banking";

interface RecentTransactionsProps {
  transactions: Transaction[] | undefined;
  accountId: string;
  isLoading: boolean;
  error: Error | null;
}

function SkeletonRow() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5 }}>
      <Skeleton variant="circular" width={44} height={44} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="55%" height={20} />
        <Skeleton variant="text" width="35%" height={16} />
      </Box>
      <Skeleton variant="text" width={70} height={20} />
    </Box>
  );
}

export function RecentTransactions({
  transactions,
  accountId,
  isLoading,
  error,
}: RecentTransactionsProps) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptLongRounded fontSize="small" color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Recent Transactions
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/transactions"
          size="small"
          variant="text"
        >
          View all
        </Button>
      </Box>

      {/* Body */}
      <Box sx={{ px: 3, pb: 1 }}>
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            Failed to load transactions.
          </Alert>
        )}

        {isLoading && (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        )}

        {!isLoading && !error && transactions?.length === 0 && (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            <ReceiptLongRounded sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
            <Typography variant="body2">No transactions yet</Typography>
          </Box>
        )}

        {!isLoading && transactions && transactions.length > 0 && (
          <AnimatedList>
            {transactions.map((tx) => (
              <AnimatedListItem key={tx.id}>
                <TransactionCard
                  transaction={tx}
                  currentAccountId={accountId}
                />
              </AnimatedListItem>
            ))}
          </AnimatedList>
        )}
      </Box>
    </Paper>
  );
}
