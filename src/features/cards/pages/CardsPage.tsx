import { Box, Typography, Chip } from "@mui/material";
import { CreditCardRounded } from "@mui/icons-material";

export function CardsPage() {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <CreditCardRounded color="primary" />
        <Typography variant="h5">My Cards</Typography>
        <Chip label="Phase 7" size="small" color="primary" variant="outlined" />
      </Box>
      <Typography color="text.secondary">
        Virtual and physical debit card management will appear here.
      </Typography>
    </Box>
  );
}
