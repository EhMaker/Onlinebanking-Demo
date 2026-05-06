import { Box, Typography, Avatar, Chip } from "@mui/material";
import { AccountBalanceRounded } from "@mui/icons-material";
import type { BankInfo } from "@/features/banking/data/bankRegistry";

interface BankBadgeProps {
  bank: BankInfo;
  /** Whether the account belongs to SmExPay (internal transfer) */
  isInternal?: boolean;
  /** compact = just the badge pill; full = row with description */
  variant?: "compact" | "full";
}

export function BankBadge({
  bank,
  isInternal = false,
  variant = "full",
}: BankBadgeProps) {
  const initials = bank.shortName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (variant === "compact") {
    return (
      <Chip
        avatar={
          <Avatar
            sx={{
              bgcolor: bank.color,
              color: "#fff !important",
              fontSize: "0.65rem",
            }}
          >
            {initials}
          </Avatar>
        }
        label={bank.shortName}
        size="small"
        sx={{ fontWeight: 600 }}
        color={isInternal ? "primary" : "default"}
        variant={isInternal ? "filled" : "outlined"}
      />
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: isInternal ? "primary.main" : "divider",
        bgcolor: isInternal ? "primary.main" + "12" : "action.hover",
      }}
    >
      <Avatar
        sx={{
          width: 36,
          height: 36,
          background: `linear-gradient(135deg, ${bank.color}, ${bank.accentColor})`,
          fontSize: "0.75rem",
          fontWeight: 700,
        }}
      >
        {initials}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {bank.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {bank.country}
          {bank.swift ? ` · SWIFT: ${bank.swift}` : ""}
        </Typography>
      </Box>
      {isInternal && (
        <Chip
          icon={<AccountBalanceRounded sx={{ fontSize: "14px !important" }} />}
          label="Internal"
          size="small"
          color="primary"
          sx={{ fontWeight: 600 }}
        />
      )}
    </Box>
  );
}
