import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Skeleton,
  Alert,
  Grid,
} from "@mui/material";
import { SendRounded, ReceiptLongRounded } from "@mui/icons-material";
import { useAccount } from "@/features/banking/hooks/useAccount";
import { useTransactions } from "@/features/banking/hooks/useTransactions";
import { useAuthStore } from "@/features/auth/store/authStore";
import { AccountCard } from "@/features/accounts/components/AccountCard";
import { TransferDialog } from "@/features/accounts/components/TransferDialog";
import { TransactionCard } from "@/features/banking/components/TransactionCard";

export function AccountsPage() {
  const { profile } = useAuthStore();
  const { data: account, isLoading, error } = useAccount();
  const { data: transactions, isLoading: txLoading } = useTransactions(
    account?.id,
    5,
  );
  const [transferOpen, setTransferOpen] = useState(false);

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            My Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your SmExPay account and transfer funds
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SendRounded />}
          onClick={() => setTransferOpen(true)}
          disabled={!account || isLoading}
          size="large"
        >
          Send Money
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load account. Please refresh.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Account card */}
        <Grid size={{ xs: 12, md: 7 }}>
          <AccountCard
            account={account}
            profile={profile}
            isLoading={isLoading}
          />
        </Grid>

        {/* Quick stats */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            variant="outlined"
            sx={{ borderRadius: 3, p: 3, height: "100%" }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Account Info
            </Typography>

            {isLoading ? (
              <>
                <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} />
              </>
            ) : account ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "success.50",
                    border: "1px solid",
                    borderColor: "success.200",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="success.700"
                    sx={{ fontWeight: 600, display: "block" }}
                  >
                    AVAILABLE BALANCE
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: "success.800" }}
                  >
                    $
                    {account.balance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, display: "block" }}
                  >
                    ROUTING NUMBER
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontFamily: "monospace",
                      letterSpacing: 1,
                    }}
                  >
                    021 000 089
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, display: "block" }}
                  >
                    SWIFT / BIC
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontFamily: "monospace",
                      letterSpacing: 1,
                    }}
                  >
                    SMXPUS33
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No account data available.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent activity preview */}
        <Grid size={{ xs: 12 }}>
          <Paper
            variant="outlined"
            sx={{ borderRadius: 3, overflow: "hidden" }}
          >
            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <ReceiptLongRounded fontSize="small" color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Recent Activity
              </Typography>
            </Box>
            <Box sx={{ px: 3, pb: 1 }}>
              {txLoading && (
                <>
                  {[1, 2, 3].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        gap: 2,
                        py: 1.5,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Skeleton variant="circular" width={44} height={44} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="50%" />
                        <Skeleton variant="text" width="30%" />
                      </Box>
                      <Skeleton variant="text" width={60} />
                    </Box>
                  ))}
                </>
              )}
              {!txLoading && !transactions?.length && (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <ReceiptLongRounded
                    sx={{ fontSize: 36, opacity: 0.2, mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    No transactions yet
                  </Typography>
                </Box>
              )}
              {!txLoading &&
                account &&
                transactions?.map((tx) => (
                  <TransactionCard
                    key={tx.id}
                    transaction={tx}
                    currentAccountId={account.id}
                  />
                ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Transfer Dialog */}
      {account && (
        <TransferDialog
          open={transferOpen}
          onClose={() => setTransferOpen(false)}
          fromAccount={account}
        />
      )}
    </Box>
  );
}
