import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  DashboardRounded,
  AccountBalanceWalletRounded,
  SwapHorizRounded,
  CreditCardRounded,
  SettingsRounded,
  AccountBalanceRounded,
  LogoutRounded,
} from "@mui/icons-material";
import { useAuthStore } from "@/features/auth/store/authStore";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardRounded /> },
  {
    label: "Accounts",
    path: "/accounts",
    icon: <AccountBalanceWalletRounded />,
  },
  { label: "Transactions", path: "/transactions", icon: <SwapHorizRounded /> },
  { label: "Cards", path: "/cards", icon: <CreditCardRounded /> },
  { label: "Settings", path: "/settings", icon: <SettingsRounded /> },
];

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

function DrawerContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuthStore();

  const displayName =
    profile?.full_name ??
    user?.user_metadata?.full_name ??
    user?.email ??
    "Account";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        px: 1.5,
        py: 2.5,
      }}
    >
      {/* Brand logo */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1.5, mb: 3 }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AccountBalanceRounded sx={{ color: "#fff", fontSize: 20 }} />
        </Box>
        <Box>
          <Typography
            variant="subtitle1"
            color="primary.main"
            sx={{ fontWeight: 700, lineHeight: 1.2 }}
          >
            SmExPay
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
            Seamless Banking
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Navigation items */}
      <List sx={{ flexGrow: 1 }} disablePadding>
        {NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`);

          return (
            <Tooltip key={item.path} title="" placement="right">
              <ListItemButton
                selected={isActive}
                onClick={() => navigate(item.path)}
                sx={{ mb: 0.5 }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontWeight: isActive ? 600 : 400,
                        fontSize: "0.9rem",
                      },
                    },
                  }}
                />
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Divider sx={{ mb: 2 }} />

      {/* User section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 1,
          py: 0.5,
          borderRadius: 3,
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: "primary.main",
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
            {displayName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user?.email}
          </Typography>
        </Box>
        <Tooltip title="Sign out">
          <IconButton
            size="small"
            onClick={() => void logout()}
            aria-label="Sign out"
            sx={{ color: "text.secondary", flexShrink: 0 }}
          >
            <LogoutRounded fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export function Sidebar({ drawerWidth, mobileOpen, onClose }: SidebarProps) {
  return (
    <Box component="nav" sx={{ flexShrink: { md: 0 } }}>
      {/* Mobile — temporary overlay drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }} // Better mobile performance
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <DrawerContent />
      </Drawer>

      {/* Desktop — permanent sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        open
      >
        <DrawerContent />
      </Drawer>
    </Box>
  );
}
