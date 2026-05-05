import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Skeleton,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  AccountBalanceRounded,
  ContentCopyRounded,
  VisibilityRounded,
  VisibilityOffRounded,
} from "@mui/icons-material";
import type { Account } from "@/types/banking";
import type { Profile } from "@/types/auth";

interface AccountCardProps {
  account: Account | null | undefined;
  profile: Profile | null;
  isLoading: boolean;
}

/** Format as IBAN-style groups: SMX 1234 5678 9012 */
function formatAccountNumber(raw: string): string {
  // Remove non-alphanumeric, then group into 4-char chunks
  const clean = raw.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  return clean.match(/.{1,4}/g)?.join(" ") ?? clean;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1.25,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}

export function AccountCard({ account, profile, isLoading }: AccountCardProps) {
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyNumber() {
    if (!account) return;
    void navigator.clipboard.writeText(account.account_number).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const formatted = account
    ? formatAccountNumber(account.account_number)
    : "— — — —";
  const balance = account
    ? account.balance.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
      {/* Card header banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1B4FD8 0%, #0D2D8A 100%)",
          px: 3,
          py: 3,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            top: -60,
            right: -40,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
          <AccountBalanceRounded
            sx={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}
          />
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.8)",
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            SmExPay Bank
          </Typography>
          {isLoading ? null : (
            <Chip
              label={account?.account_type ?? "checking"}
              size="small"
              sx={{
                ml: "auto",
                bgcolor: "rgba(255,255,255,0.15)",
                color: "#fff",
                fontWeight: 600,
                textTransform: "capitalize",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
          )}
        </Box>

        {/* Account number */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}
          >
            ACCOUNT NUMBER
          </Typography>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}
          >
            {isLoading ? (
              <Skeleton
                width={200}
                height={28}
                sx={{ bgcolor: "rgba(255,255,255,0.15)" }}
              />
            ) : (
              <>
                <Typography
                  sx={{
                    color: "#fff",
                    fontFamily: "monospace",
                    fontSize: "1.05rem",
                    letterSpacing: 2,
                    fontWeight: 600,
                  }}
                >
                  {hidden ? "•••• •••• •••• ••••" : formatted}
                </Typography>
                <Tooltip title={hidden ? "Show" : "Hide"}>
                  <IconButton
                    size="small"
                    onClick={() => setHidden((v) => !v)}
                    sx={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {hidden ? (
                      <VisibilityRounded sx={{ fontSize: 16 }} />
                    ) : (
                      <VisibilityOffRounded sx={{ fontSize: 16 }} />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title={copied ? "Copied!" : "Copy"}>
                  <IconButton
                    size="small"
                    onClick={copyNumber}
                    sx={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    <ContentCopyRounded sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        {/* Balance */}
        <Box>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}
          >
            AVAILABLE BALANCE
          </Typography>
          {isLoading ? (
            <Skeleton
              width={180}
              height={40}
              sx={{ bgcolor: "rgba(255,255,255,0.15)" }}
            />
          ) : (
            <Typography
              variant="h4"
              sx={{ color: "#fff", fontWeight: 800, mt: 0.25, lineHeight: 1 }}
            >
              {hidden ? "••••••" : `$${balance}`}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Detail rows */}
      <Box sx={{ px: 3, pt: 0.5, pb: 1 }}>
        <DetailRow label="Account holder" value={profile?.full_name ?? "—"} />
        <DetailRow label="Currency" value={account?.currency ?? "USD"} />
        <DetailRow
          label="Account type"
          value={
            <Box sx={{ textTransform: "capitalize" }}>
              {account?.account_type ?? "Checking"}
            </Box>
          }
        />
        <DetailRow
          label="Opened"
          value={
            account
              ? new Date(account.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "—"
          }
        />
        <DetailRow
          label="Status"
          value={
            <Chip
              label="Active"
              color="success"
              size="small"
              sx={{ height: 20, fontSize: "0.7rem" }}
            />
          }
        />
      </Box>
    </Paper>
  );
}
