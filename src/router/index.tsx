import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { GuestRoute } from "@/components/auth/GuestRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { SignupPage } from "@/features/auth/pages/SignupPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { AccountsPage } from "@/features/accounts/pages/AccountsPage";
import { TransactionsPage } from "@/features/transactions/pages/TransactionsPage";
import { CardsPage } from "@/features/cards/pages/CardsPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── Public (guest-only) routes ── */}
        <Route
          element={
            <GuestRoute>
              <AuthLayout />
            </GuestRoute>
          }
        >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* ── Password-reset route ── */}
        <Route element={<AuthLayout />}>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* ── Protected (authenticated) routes ── */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <ErrorBoundary>
                <DashboardPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/accounts"
            element={
              <ErrorBoundary>
                <AccountsPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/accounts/:id"
            element={
              <ErrorBoundary>
                <AccountsPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/transactions"
            element={
              <ErrorBoundary>
                <TransactionsPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/cards"
            element={
              <ErrorBoundary>
                <CardsPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/settings"
            element={
              <ErrorBoundary>
                <SettingsPage />
              </ErrorBoundary>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export function AppRouter() {
  return <AnimatedRoutes />;
}
