import { Box, Typography, Chip } from "@mui/material";
import { SettingsRounded } from "@mui/icons-material";

export function SettingsPage() {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <SettingsRounded color="primary" />
        <Typography variant="h5">Settings</Typography>
        <Chip label="Phase 9" size="small" color="primary" variant="outlined" />
      </Box>
      <Typography color="text.secondary">
        Profile settings, dark mode, notifications, and preferences will appear
        here.
      </Typography>
    </Box>
  );
}
