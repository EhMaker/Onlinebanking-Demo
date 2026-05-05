import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export const DRAWER_WIDTH = 260;
export const TOPBAR_HEIGHT = 64;

export function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isMobile={isMobile}
      />

      {/* Main column — offset by sidebar on desktop */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0, // prevent content overflow
          ml: { md: `${DRAWER_WIDTH}px` },
          mt: `${TOPBAR_HEIGHT}px`,
        }}
      >
        <Topbar
          drawerWidth={DRAWER_WIDTH}
          topbarHeight={TOPBAR_HEIGHT}
          onMenuToggle={() => setMobileOpen(true)}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            minHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
