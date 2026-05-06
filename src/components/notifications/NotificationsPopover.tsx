import {
  Popover,
  Box,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Skeleton,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  HourglassTopRounded,
  ErrorOutlineRounded,
  NotificationsNoneRounded,
} from "@mui/icons-material";
import type {
  AppNotification,
  NotificationType,
} from "@/hooks/useNotifications";

interface NotificationsPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

function relativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ReactNode; color: string }
> = {
  credit: { icon: <ArrowDownwardRounded fontSize="small" />, color: "#1A6B3C" },
  debit: { icon: <ArrowUpwardRounded fontSize="small" />, color: "#1B4FD8" },
  pending: {
    icon: <HourglassTopRounded fontSize="small" />,
    color: "#7D5700",
  },
  failed: {
    icon: <ErrorOutlineRounded fontSize="small" />,
    color: "#B3261E",
  },
};

export function NotificationsPopover({
  anchorEl,
  onClose,
  notifications,
  unreadCount,
  isLoading,
  onMarkRead,
  onMarkAllRead,
}: NotificationsPopoverProps) {
  const theme = useTheme();
  const open = Boolean(anchorEl);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: {
            width: 360,
            maxHeight: 500,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 8px 32px rgba(0,0,0,0.5)"
                : "0 8px 32px rgba(26,28,42,0.12)",
            mt: 1,
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Box
              sx={{
                px: 0.75,
                py: 0.1,
                borderRadius: 99,
                bgcolor: "error.main",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                lineHeight: "18px",
                minWidth: 18,
                textAlign: "center",
              }}
            >
              {unreadCount}
            </Box>
          )}
        </Box>

        {unreadCount > 0 && (
          <Button
            size="small"
            onClick={onMarkAllRead}
            sx={{ fontSize: 12, fontWeight: 600 }}
          >
            Mark all read
          </Button>
        )}
      </Box>

      <Divider />

      {/* Body */}
      <Box sx={{ overflow: "auto", flex: 1 }}>
        {isLoading ? (
          <Box sx={{ p: 2 }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{ display: "flex", gap: 1.5, mb: 2, alignItems: "center" }}
              >
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="85%" height={14} sx={{ mt: 0.5 }} />
                </Box>
              </Box>
            ))}
          </Box>
        ) : notifications.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
              gap: 1,
              color: "text.secondary",
            }}
          >
            <NotificationsNoneRounded sx={{ fontSize: 40, opacity: 0.4 }} />
            <Typography variant="body2">No notifications yet</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((n, idx) => {
              const cfg = TYPE_CONFIG[n.type];
              return (
                <Box key={n.id}>
                  <ListItemButton
                    onClick={() => onMarkRead(n.id)}
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      gap: 1.5,
                      bgcolor: n.read
                        ? "transparent"
                        : alpha(theme.palette.primary.main, 0.04),
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 44 }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: alpha(cfg.color, 0.12),
                          color: cfg.color,
                        }}
                      >
                        {cfg.icon}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={n.title}
                      secondary={`${n.message} · ${relativeTime(n.timestamp)}`}
                      slotProps={{
                        primary: {
                          sx: {
                            fontWeight: n.read ? 400 : 600,
                            fontSize: 13,
                            lineHeight: 1.4,
                          },
                        },
                        secondary: {
                          sx: { fontSize: 12, mt: 0.25 },
                        },
                      }}
                    />

                    {!n.read && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </ListItemButton>
                  {idx < notifications.length - 1 && (
                    <Divider sx={{ mx: 2.5 }} />
                  )}
                </Box>
              );
            })}
          </List>
        )}
      </Box>
    </Popover>
  );
}
