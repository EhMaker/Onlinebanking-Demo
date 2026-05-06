import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/features/auth/store/authStore";
import { fetchProfile } from "@/features/auth/services/authService";

/**
 * Bootstraps Supabase auth state on app mount.
 *
 * - Reads the existing session from localStorage (no network call).
 * - Subscribes to onAuthStateChange so session refreshes, logins,
 *   and logouts are reflected in the Zustand store automatically.
 *
 * Mount this hook once — inside AppProviders.
 */
export function useAuthInit() {
  const { _setAuthState, _setProfile, _setInitialized, _setPasswordRecovery } =
    useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // 0. If Supabase redirected back with an error (e.g. expired OTP),
    //    parse it from the URL hash and send the user to /login with a message.
    const hash = window.location.hash;
    if (hash.includes("error=")) {
      const params = new URLSearchParams(hash.replace(/^#\/?/, ""));
      const errorCode = params.get("error_code") ?? "";
      const errorDesc =
        params.get("error_description")?.replace(/\+/g, " ") ??
        "The link is invalid or has expired.";

      let message = errorDesc;
      if (errorCode === "otp_expired") {
        message =
          "Your confirmation link has expired. Please sign up again to receive a new one.";
      }

      // Clear the hash so the error params don't persist on reload
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
      navigate("/login", { replace: true, state: { authError: message } });
    }

    // 1. Get the current session synchronously from storage, then mark initialized.
    //    This prevents a flicker where the app briefly shows the login page
    //    even when the user already has a valid session.
    supabase.auth.getSession().then(({ data: { session } }) => {
      _setAuthState({ user: session?.user ?? null, session });
      _setInitialized();

      if (session?.user) {
        fetchProfile(session.user.id).then(_setProfile);
      }
    });

    // 2. Subscribe to all future auth changes (login, logout, token refresh, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Mark password-recovery mode so ResetPasswordPage can gate access.
      if (event === "PASSWORD_RECOVERY") {
        _setPasswordRecovery(true);
      }

      // After email verification, Supabase fires SIGNED_IN with type=signup.
      // Sign the user back out and redirect to login so they log in explicitly.
      if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
        const isVerificationCallback =
          window.location.hash.includes("access_token") ||
          window.location.hash.includes("type=signup");
        if (isVerificationCallback) {
          await supabase.auth.signOut();
          navigate("/login", { replace: true });
          return;
        }
      }

      _setAuthState({ user: session?.user ?? null, session });

      if (session?.user) {
        fetchProfile(session.user.id).then(_setProfile);
      } else {
        _setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [
    _setAuthState,
    _setProfile,
    _setInitialized,
    _setPasswordRecovery,
    navigate,
  ]);
}
