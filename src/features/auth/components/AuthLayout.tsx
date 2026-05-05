import { Outlet, Link as RouterLink } from "react-router-dom";
import { Box, Typography, Paper } from "@mui/material";
import { AccountBalanceRounded } from "@mui/icons-material";

export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      {/* Left decorative panel — hidden on mobile */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "45%",
          flexShrink: 0,
          background: "linear-gradient(145deg, #1B4FD8 0%, #0D2D8A 100%)",
          px: 6,
          gap: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "14px",
              bgcolor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AccountBalanceRounded sx={{ color: "#fff", fontSize: 28 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>
            SmExPay
          </Typography>
        </Box>

        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "#fff", textAlign: "center", maxWidth: 360, lineHeight: 1.35 }}
        >
          Banking that moves as fast as you do.
        </Typography>

        <Typography
          variant="body1"
          sx={{ color: "rgba(255,255,255,0.7)", textAlign: "center", maxWidth: 340 }}
        >
          Send money, manage accounts, and track every transaction — all in one
          place.
        </Typography>
      </Box>

      {/* Right form panel */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 4 },
          py: 6,
        }}
      >
        {/* Mobile brand mark */}
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center",
            gap: 1,
            mb: 4,
            textDecoration: "none",
          }}
        >
          <AccountBalanceRounded color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
            SmExPay
          </Typography>
        </Box>

        <Paper
          sx={{
            width: "100%",
            maxWidth: 440,
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Outlet />
        </Paper>
      </Box>
    </Box>
  );
}
