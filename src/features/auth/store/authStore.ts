import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type {
  AuthState,
  LoginCredentials,
  SignupCredentials,
  Profile,
} from "@/types/auth";

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  /** Called once on app boot by useAuthInit — sets user/session from Supabase */
  _setAuthState: (state: Pick<AuthState, "user" | "session">) => void;
  _setProfile: (profile: Profile | null) => void;
  _setInitialized: () => void;
  _setError: (error: string | null) => void;
  _setPasswordRecovery: (value: boolean) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // ---- initial state ----
  user: null,
  session: null,
  profile: null,
  isInitialized: false,
  isLoading: false,
  error: null,
  isPasswordRecovery: false,

  // ---- internal setters (only called from useAuthInit) ----
  _setAuthState: ({ user, session }) => set({ user, session }),
  _setProfile: (profile) => set({ profile }),
  _setInitialized: () => set({ isInitialized: true }),
  _setError: (error) => set({ error }),
  _setPasswordRecovery: (isPasswordRecovery) => set({ isPasswordRecovery }),
  clearError: () => set({ error: null }),

  // ---- public actions ----

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Eagerly update store so navigate() in the login form doesn't hit a
      // stale ProtectedRoute before onAuthStateChange fires.
      if (data.session) {
        set({ user: data.session.user, session: data.session });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      set({ error: message });
      throw err; // re-throw so form can react
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async ({ email, password, fullName }) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          // emailRedirectTo defaults to window.location.origin — fine for local dev
        },
      });
      if (error) throw error;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Sign-up failed. Please try again.";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null, profile: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed.";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  sendPasswordReset: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Reset email failed.";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePassword: async (newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      set({ isPasswordRecovery: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update password.";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
