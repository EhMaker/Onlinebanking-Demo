import type { ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { theme } from "@/theme/theme";
import { queryClient } from "@/lib/queryClient";
import { useAuthInit } from "@/features/auth/hooks/useAuthInit";

interface AppProvidersProps {
  children: ReactNode;
}

// Inner component so hooks can run inside QueryClientProvider context
function AuthInitializer({ children }: AppProvidersProps) {
  useAuthInit();
  return <>{children}</>;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthInitializer>{children}</AuthInitializer>
        </BrowserRouter>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
