import { useMemo, type ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HashRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { createAppTheme } from "@/theme/theme";
import { queryClient } from "@/lib/queryClient";
import { useAuthInit } from "@/features/auth/hooks/useAuthInit";
import { useThemeStore } from "@/stores/themeStore";

interface AppProvidersProps {
  children: ReactNode;
}

// Inner component so hooks can run inside QueryClientProvider context
function AuthInitializer({ children }: AppProvidersProps) {
  useAuthInit();
  return <>{children}</>;
}

export function AppProviders({ children }: AppProvidersProps) {
  const mode = useThemeStore((s) => s.mode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={4}
          autoHideDuration={3500}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <HashRouter>
            <AuthInitializer>{children}</AuthInitializer>
          </HashRouter>
        </SnackbarProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
