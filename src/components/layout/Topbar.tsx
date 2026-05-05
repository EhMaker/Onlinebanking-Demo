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
import { MenuRounded, NotificationsOutlined } from "@mui/icons-material";
import { useAuthStore } from "@/features/auth/store/authStore";

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

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton aria-label="notifications">
            <Badge badgeContent={3} color="error">
              <NotificationsOutlined />
            </Badge>
          </IconButton>
        </Tooltip>

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
