import { Box, Typography, Avatar, Chip } from "@mui/material";
import {
  ArrowUpwardRounded,
  ArrowDownwardRounded,
  SwapHorizRounded,
  AddCircleOutlineRounded,
  RemoveCircleOutlineRounded,
} from "@mui/icons-material";
import type { Transaction } from "@/types/banking";
import { isDebit, signedAmount } from "@/types/banking";

interface TransactionCardProps {
  transaction: Transaction;
  currentAccountId: string;
}

const TYPE_META: Record<
  string,
  { label: string; Icon: React.ElementType; color: string }
> = {
  transfer: {
    label: "Transfer",
    Icon: SwapHorizRounded,
    color: "#1B4FD8",
  },
  deposit: {
    label: "Deposit",
    Icon: AddCircleOutlineRounded,
    color: "#16a34a",
  },
  withdrawal: {
    label: "Withdrawal",
    Icon: RemoveCircleOutlineRounded,
    color: "#dc2626",
  },
};

const STATUS_COLOR: Record<
  string,
  "default" | "success" | "error" | "warning"
> = {
  completed: "success",
  pending: "warning",
  failed: "error",
};

function formatAmount(tx: Transaction, accountId: string): string {
  const signed = signedAmount(tx, accountId);
  const abs = Math.abs(signed).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${signed >= 0 ? "+" : "-"}$${abs}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TransactionCard({
  transaction,
  currentAccountId,
}: TransactionCardProps) {
  const debit = isDebit(transaction, currentAccountId);
  const signed = signedAmount(transaction, currentAccountId);
  const meta = TYPE_META[transaction.type] ?? TYPE_META.transfer;
  const { Icon, color } = meta;
  const amountColor = signed >= 0 ? "success.main" : "error.main";
  const ArrowIcon = debit ? ArrowUpwardRounded : ArrowDownwardRounded;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 1.5,
        px: 0,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-child": { borderBottom: "none" },
      }}
    >
      {/* Icon avatar */}
      <Avatar
        sx={{
          width: 44,
          height: 44,
          bgcolor: `${color}18`,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ color, fontSize: 22 }} />
      </Avatar>

      {/* Description + date */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {transaction.description ?? meta.label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDate(transaction.created_at)}
        </Typography>
      </Box>

      {/* Status + amount */}
      <Box sx={{ textAlign: "right", flexShrink: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color: amountColor }}
        >
          <ArrowIcon sx={{ fontSize: 12, verticalAlign: "middle", mr: 0.25 }} />
          {formatAmount(transaction, currentAccountId)}
        </Typography>
        {transaction.status !== "completed" && (
          <Chip
            label={transaction.status}
            size="small"
            color={STATUS_COLOR[transaction.status] ?? "default"}
            sx={{ mt: 0.25, height: 18, fontSize: "0.65rem" }}
          />
        )}
      </Box>
    </Box>
  );
}
