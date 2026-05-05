import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";
import type { ReactNode } from "react";

/**
 * Wraps public-only routes (login, signup).
 * Redirects already-authenticated users to /dashboard so they don't land on
 * the login page with an active session.
 */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, isInitialized } = useAuthStore();

  // Don't redirect until auth is resolved — prevents flash
  if (!isInitialized) return null;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
