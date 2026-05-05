import {
  Box,
  Typography,
  Skeleton,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  VisibilityRounded,
  VisibilityOffRounded,
  ContentCopyRounded,
  RefreshRounded,
} from "@mui/icons-material";
import { useState } from "react";
import type { Account } from "@/types/banking";

interface BalanceCardProps {
  account: Account | null | undefined;
  isLoading: boolean;
  onRefresh?: () => void;
}

function maskAccountNumber(num: string): string {
  if (num.length <= 4) return num;
  return `${num.slice(0, 3)} ···· ${num.slice(-4)}`;
}

export function BalanceCard({
  account,
  isLoading,
  onRefresh,
}: BalanceCardProps) {
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyAccountNumber() {
    if (!account) return;
    void navigator.clipboard.writeText(account.account_number).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const formattedBalance = account
    ? account.balance.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  return (
    <Box
      sx={{
        borderRadius: 4,
        background: "linear-gradient(135deg, #1B4FD8 0%, #0D2D8A 100%)",
        p: { xs: 3, sm: 4 },
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        minHeight: 200,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        // Decorative circles
        "&::before": {
          content: '""',
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          top: -60,
          right: -60,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          bottom: -40,
          left: 20,
        },
      }}
    >
      {/* Top row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.7)", letterSpacing: 1 }}
          >
            TOTAL BALANCE
          </Typography>
          {isLoading ? (
            <Skeleton
              variant="text"
              width={200}
              height={56}
              sx={{ bgcolor: "rgba(255,255,255,0.15)" }}
            />
          ) : (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
            >
              <Typography
                variant="h3"
                sx={{ fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}
              >
                {hidden ? "••••••" : `$${formattedBalance}`}
              </Typography>
              <Tooltip title={hidden ? "Show balance" : "Hide balance"}>
                <IconButton
                  size="small"
                  onClick={() => setHidden((v) => !v)}
                  sx={{ color: "rgba(255,255,255,0.7)", mt: 0.25 }}
                >
                  {hidden ? (
                    <VisibilityRounded fontSize="small" />
                  ) : (
                    <VisibilityOffRounded fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        <Tooltip title="Refresh balance">
          <IconButton
            size="small"
            onClick={onRefresh}
            sx={{ color: "rgba(255,255,255,0.7)" }}
          >
            <RefreshRounded fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Bottom row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        {isLoading ? (
          <Skeleton
            variant="text"
            width={160}
            sx={{ bgcolor: "rgba(255,255,255,0.15)" }}
          />
        ) : account ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.85)",
                fontFamily: "monospace",
                letterSpacing: 1,
              }}
            >
              {maskAccountNumber(account.account_number)}
            </Typography>
            <Tooltip title={copied ? "Copied!" : "Copy account number"}>
              <IconButton
                size="small"
                onClick={copyAccountNumber}
                sx={{ color: "rgba(255,255,255,0.6)", p: 0.25 }}
              >
                <ContentCopyRounded sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
            No account yet
          </Typography>
        )}

        <Chip
          label={account?.account_type ?? "Checking"}
          size="small"
          sx={{
            bgcolor: "rgba(255,255,255,0.15)",
            color: "#fff",
            fontWeight: 600,
            textTransform: "capitalize",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        />
      </Box>
    </Box>
  );
}
