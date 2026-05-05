import { Box, Paper, Typography, Skeleton } from "@mui/material";
import {
  TrendingUpRounded,
  TrendingDownRounded,
  SwapHorizRounded,
} from "@mui/icons-material";

interface StatCardProps {
  label: string;
  value: string;
  Icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  isLoading: boolean;
}

function StatCard({
  label,
  value,
  Icon,
  iconColor,
  iconBg,
  isLoading,
}: StatCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ color: iconColor, fontSize: 24 }} />
      </Box>
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block" }}
        >
          {label}
        </Typography>
        {isLoading ? (
          <Skeleton variant="text" width={80} height={28} />
        ) : (
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {value}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

interface DashboardStatsProps {
  income: number;
  expenses: number;
  transactionCount: number;
  isLoading: boolean;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function DashboardStats({
  income,
  expenses,
  transactionCount,
  isLoading,
}: DashboardStatsProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
        gap: 2,
      }}
    >
      <StatCard
        label="Income this month"
        value={`$${fmt(income)}`}
        Icon={TrendingUpRounded}
        iconColor="#16a34a"
        iconBg="#dcfce7"
        isLoading={isLoading}
      />
      <StatCard
        label="Expenses this month"
        value={`$${fmt(expenses)}`}
        Icon={TrendingDownRounded}
        iconColor="#dc2626"
        iconBg="#fee2e2"
        isLoading={isLoading}
      />
      <StatCard
        label="Transactions"
        value={transactionCount.toString()}
        Icon={SwapHorizRounded}
        iconColor="#1B4FD8"
        iconBg="#dbeafe"
        isLoading={isLoading}
      />
    </Box>
  );
}
