import { Box, Typography, Chip } from "@mui/material";
import { AccountBalanceWalletRounded } from "@mui/icons-material";

export function AccountsPage() {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <AccountBalanceWalletRounded color="primary" />
        <Typography variant="h5">My Accounts</Typography>
        <Chip label="Phase 4" size="small" color="primary" variant="outlined" />
      </Box>
      <Typography color="text.secondary">
        Account management, balance details, and account number lookup will
        appear here.
      </Typography>
    </Box>
  );
}
