import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuthStore } from "@/features/auth/store/authStore";

export function ForgotPasswordPage() {
  const { sendPasswordReset, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [fieldError, setFieldError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (!email) {
      setFieldError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("Enter a valid email.");
      return;
    }
    setFieldError("");

    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch {
      // error set in store
    }
  }

  if (sent) {
    return (
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Reset link sent
        </Typography>
        <Alert severity="success" sx={{ mb: 3 }}>
          Check your inbox at <strong>{email}</strong> for the reset link.
        </Alert>
        <Link component={RouterLink} to="/login" variant="body2">
          ← Back to sign in
        </Link>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Forgot password?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter your email and we'll send a reset link.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <TextField
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!fieldError}
        helperText={fieldError}
        fullWidth
        autoFocus
        sx={{ mb: 3 }}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={isLoading}
        sx={{ mb: 2 }}
      >
        {isLoading ? (
          <CircularProgress size={22} color="inherit" />
        ) : (
          "Send reset link"
        )}
      </Button>

      <Link component={RouterLink} to="/login" variant="body2">
        ← Back to sign in
      </Link>
    </Box>
  );
}
