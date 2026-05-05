import type { User, Session } from "@supabase/supabase-js";

// Re-export Supabase primitives so the rest of the app never imports
// directly from @supabase/supabase-js — keeps the dependency contained.
export type { User, Session };

// ---------------------------------------------------------------------------
// Credentials
// ---------------------------------------------------------------------------

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  fullName: string;
}

// ---------------------------------------------------------------------------
// Profile — mirrors the `profiles` table you created in Supabase.
// Adjust columns to match your actual schema.
// ---------------------------------------------------------------------------

export interface Profile {
  id: string; // uuid — FK → auth.users.id
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Auth store shape
// ---------------------------------------------------------------------------

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  /** True while Supabase is resolving the initial session on page load */
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  /** True when the user landed via a password-reset email link */
  isPasswordRecovery: boolean;
}
