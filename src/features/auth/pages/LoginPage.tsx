import { useState } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  CircularProgress,
} from "@mui/material";
import { VisibilityRounded, VisibilityOffRounded } from "@mui/icons-material";
import { useAuthStore } from "@/features/auth/store/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Redirect to the page the user was trying to access, or /dashboard
  const from =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  function validate() {
    const errors: typeof fieldErrors = {};
    if (!email) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Enter a valid email.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6)
      errors.password = "Password must be at least 6 characters.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch {
      // error is already set in the store
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Welcome back
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Sign in to your SmExPay account
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
        error={!!fieldErrors.email}
        helperText={fieldErrors.email}
        fullWidth
        autoComplete="email"
        autoFocus
        sx={{ mb: 2 }}
      />

      <TextField
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!fieldErrors.password}
        helperText={fieldErrors.password}
        fullWidth
        autoComplete="current-password"
        sx={{ mb: 1 }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  edge="end"
                >
                  {showPassword ? (
                    <VisibilityOffRounded />
                  ) : (
                    <VisibilityRounded />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Link
          component={RouterLink}
          to="/forgot-password"
          variant="body2"
          underline="hover"
        >
          Forgot password?
        </Link>
      </Box>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={isLoading}
        sx={{ mb: 2 }}
      >
        {isLoading ? <CircularProgress size={22} color="inherit" /> : "Sign in"}
      </Button>

      <Divider sx={{ my: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Don't have an account?
        </Typography>
      </Divider>

      <Button
        component={RouterLink}
        to="/signup"
        variant="outlined"
        fullWidth
        size="large"
      >
        Create account
      </Button>
    </Box>
  );
}
