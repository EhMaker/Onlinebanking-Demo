import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  MenuItem,
  Skeleton,
  Alert,
  Divider,
  Chip,
} from "@mui/material";
import {
  SwapHorizRounded,
  TrendingUpRounded,
  TrendingDownRounded,
} from "@mui/icons-material";
import { useAccount } from "@/features/banking/hooks/useAccount";
import { useTransactions } from "@/features/banking/hooks/useTransactions";
import { TransactionCard } from "@/features/banking/components/TransactionCard";
import { signedAmount } from "@/types/banking";
import type { TransactionType, TransactionStatus } from "@/types/banking";
import { PageTransition } from "@/components/motion/PageTransition";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/motion/AnimatedList";

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------

type TypeFilter = TransactionType | "all";
type StatusFilter = TransactionStatus | "all";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TransactionsPage() {
  const { data: account, isLoading: accountLoading } = useAccount();
  const { data: transactions = [], isLoading: txLoading } = useTransactions(
    account?.id,
    100, // load up to 100 for client-side filtering
  );

  // Filters
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  // Filtered + searched transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const desc = (tx.description ?? "").toLowerCase();
        const amt = String(tx.amount);
        if (!desc.includes(q) && !amt.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, statusFilter, search]);

  // Summary for filtered set
  const { totalIn, totalOut } = useMemo(() => {
    if (!account) return { totalIn: 0, totalOut: 0 };
    let totalIn = 0;
    let totalOut = 0;
    for (const tx of filtered) {
      const s = signedAmount(tx, account.id);
      if (s > 0) totalIn += s;
      else totalOut += Math.abs(s);
    }
    return { totalIn, totalOut };
  }, [filtered, account]);

  const isLoading = accountLoading || txLoading;

  function formatMoney(n: number) {
    return n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });
  }

  return (
    <PageTransition>
      <Box>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <SwapHorizRounded color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Transactions
          </Typography>
        </Box>

        {/* Summary chips */}
        {!isLoading && account && (
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                flex: 1,
                minWidth: 160,
              }}
            >
              <TrendingUpRounded sx={{ color: "success.main", fontSize: 28 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total In
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 700, color: "success.main" }}
                >
                  {formatMoney(totalIn)}
                </Typography>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                flex: 1,
                minWidth: 160,
              }}
            >
              <TrendingDownRounded sx={{ color: "error.main", fontSize: 28 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Out
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 700, color: "error.main" }}
                >
                  {formatMoney(totalOut)}
                </Typography>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                flex: 1,
                minWidth: 160,
              }}
            >
              <SwapHorizRounded sx={{ color: "primary.main", fontSize: 28 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Showing
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {filtered.length}{" "}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                  >
                    / {transactions.length}
                  </Typography>
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Filter row */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Type filter */}
          <ToggleButtonGroup
            value={typeFilter}
            exclusive
            onChange={(_, v) => v && setTypeFilter(v as TypeFilter)}
            size="small"
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="transfer">Transfers</ToggleButton>
            <ToggleButton value="deposit">Deposits</ToggleButton>
            <ToggleButton value="withdrawal">Withdrawals</ToggleButton>
          </ToggleButtonGroup>

          {/* Status filter */}
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </TextField>

          {/* Search */}
          <TextField
            size="small"
            label="Search"
            placeholder="Description or amount…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 180 }}
          />
        </Paper>

        {/* Transaction list */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Transaction History
            </Typography>
            {filtered.length > 0 && (
              <Chip
                label={`${filtered.length} record${filtered.length !== 1 ? "s" : ""}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          <Divider />

          {/* Loading skeletons */}
          {isLoading && (
            <Box sx={{ px: 2 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Skeleton variant="circular" width={44} height={44} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="40%" height={12} sx={{ mt: 0.5 }} />
                  </Box>
                  <Skeleton width={80} height={16} />
                </Box>
              ))}
            </Box>
          )}

          {/* Error / empty states */}
          {!isLoading && !account && (
            <Alert severity="warning" sx={{ m: 2 }}>
              No account found. Please contact support.
            </Alert>
          )}

          {!isLoading && account && filtered.length === 0 && (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <SwapHorizRounded
                sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
              />
              <Typography color="text.secondary">
                {transactions.length === 0
                  ? "No transactions yet. Send money to get started."
                  : "No transactions match your filters."}
              </Typography>
            </Box>
          )}

          {/* List */}
          {!isLoading && account && filtered.length > 0 && (
            <Box sx={{ px: 2 }}>
              <AnimatedList>
                {filtered.map((tx) => (
                  <AnimatedListItem key={tx.id}>
                    <TransactionCard
                      transaction={tx}
                      currentAccountId={account.id}
                    />
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            </Box>
          )}
        </Paper>
      </Box>
    </PageTransition>
  );
}
