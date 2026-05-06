import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Badge,
  Tooltip,
} from "@mui/material";
import {
  MenuRounded,
  NotificationsOutlined,
  DarkModeRounded,
  LightModeRounded,
} from "@mui/icons-material";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/accounts": "My Accounts",
  "/transactions": "Transactions",
  "/cards": "My Cards",
  "/settings": "Settings",
};

interface TopbarProps {
  drawerWidth: number;
  topbarHeight: number;
  onMenuToggle: () => void;
}

export function Topbar({
  drawerWidth,
  topbarHeight,
  onMenuToggle,
}: TopbarProps) {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? "SmExPay";

  const { user, profile } = useAuthStore();
  const { mode, toggleMode } = useThemeStore();
  const { notifications, unreadCount, isLoading, markRead, markAllAsRead } =
    useNotifications();

  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);
  const displayName =
    profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email ?? "";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        height: topbarHeight,
        justifyContent: "center",
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 }, gap: 1 }}>
        {/* Hamburger — mobile only */}
        <IconButton
          edge="start"
          onClick={onMenuToggle}
          aria-label="open navigation menu"
          sx={{ mr: 1, display: { md: "none" } }}
        >
          <MenuRounded />
        </IconButton>

        {/* Page title */}
        <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
          {title}
        </Typography>

        {/* Dark / Light mode toggle */}
        <Tooltip
          title={
            mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          <IconButton onClick={toggleMode} aria-label="toggle color mode">
            {mode === "dark" ? <LightModeRounded /> : <DarkModeRounded />}
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton
            aria-label="notifications"
            onClick={(e) => setNotifAnchor(e.currentTarget)}
          >
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsOutlined />
            </Badge>
          </IconButton>
        </Tooltip>

        <NotificationsPopover
          anchorEl={notifAnchor}
          onClose={() => setNotifAnchor(null)}
          notifications={notifications}
          unreadCount={unreadCount}
          isLoading={isLoading}
          onMarkRead={markRead}
          onMarkAllRead={markAllAsRead}
        />

        {/* User avatar */}
        <Tooltip title={displayName || "Account"}>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: "primary.main",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              ml: 0.5,
            }}
          >
            {initials}
          </Avatar>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
