import { Box, Typography, Chip } from "@mui/material";
import { SwapHorizRounded } from "@mui/icons-material";

export function TransactionsPage() {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <SwapHorizRounded color="primary" />
        <Typography variant="h5">Transactions</Typography>
        <Chip label="Phase 5" size="small" color="primary" variant="outlined" />
      </Box>
      <Typography color="text.secondary">
        Send money, view transaction history, and filter records will appear
        here.
      </Typography>
    </Box>
  );
}
