import {
  ArrowForwardRounded,
  LockRounded,
  ShieldRounded,
} from "@mui/icons-material";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import logo from "@/assets/logo_transparent_background.png";

const MotionBox = motion.create(Box);

export function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        px: { xs: 2.5, sm: 4 },
        py: { xs: 5, md: 8 },
        background:
          "radial-gradient(circle at 14% 18%, rgba(84,120,228,0.26), transparent 28%), radial-gradient(circle at 88% 82%, rgba(0,105,74,0.2), transparent 30%), linear-gradient(135deg, #08132f 0%, #102b5d 54%, #0c4039 100%)",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          opacity: 0.2,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "linear-gradient(to bottom, black, transparent 80%)",
        },
      }}
    >
      <MotionBox
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        sx={{
          width: "100%",
          maxWidth: 760,
          position: "relative",
          zIndex: 1,
          textAlign: "center",
        }}
      >
        <Chip
          icon={<ShieldRounded sx={{ fontSize: 18 }} />}
          label="Banking made clear"
          sx={{
            mb: { xs: 3, sm: 4 },
            px: 1,
            color: "rgba(255,255,255,0.88)",
            bgcolor: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(10px)",
          }}
        />

        <Box
          component="img"
          src={logo}
          alt="SmExPay Bank logo"
          sx={{
            display: "block",
            width: { xs: 180, sm: 230 },
            maxWidth: "75vw",
            height: "auto",
            mx: "auto",
            mb: { xs: 3, sm: 4 },
            borderRadius: "10px",
            boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
          }}
        />

        <Typography
          component="h1"
          sx={{
            color: "#fff",
            fontSize: { xs: "2.6rem", sm: "4.5rem" },
            fontWeight: 800,
            letterSpacing: "0.01em",
            lineHeight: 1.05,
            mb: 2,
          }}
        >
          Fast and Sure Banking
        </Typography>

        <Typography
          sx={{
            maxWidth: 520,
            mx: "auto",
            color: "rgba(255,255,255,0.72)",
            fontSize: { xs: "1rem", sm: "1.15rem" },
            lineHeight: 1.7,
            mb: { xs: 4, sm: 5 },
          }}
        >
          Move money confidently, keep every account in view, and spend more
          time on what matters.
        </Typography>

        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          size="large"
          endIcon={<ArrowForwardRounded />}
          sx={{
            px: 3.5,
            py: 1.5,
            bgcolor: "#fff",
            color: "#123d89",
            fontSize: "1rem",
            boxShadow: "0 14px 30px rgba(0,0,0,0.2)",
            "&:hover": {
              bgcolor: "#eaf0ff",
              boxShadow: "0 18px 34px rgba(0,0,0,0.25)",
            },
          }}
        >
          Get started
        </Button>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1, sm: 3 }}
          sx={{
            mt: 4,
            color: "rgba(255,255,255,0.62)",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.75,
            }}
          >
            <LockRounded sx={{ fontSize: 16 }} /> Secure access
          </Typography>
          <Typography variant="body2">Simple. Transparent. Yours.</Typography>
        </Stack>
      </MotionBox>
    </Box>
  );
}
