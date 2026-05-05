import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
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

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  function validate() {
    const errors: typeof fieldErrors = {};
    if (!fullName.trim()) errors.fullName = "Full name is required.";
    if (!email) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Enter a valid email.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 8)
      errors.password = "Password must be at least 8 characters.";
    else if (!/[A-Z]/.test(password))
      errors.password = "Include at least one uppercase letter.";
    else if (!/[0-9]/.test(password))
      errors.password = "Include at least one number.";
    if (confirmPassword !== password)
      errors.confirmPassword = "Passwords do not match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    try {
      await signup({ email, password, fullName });
      setSignedUp(true);
    } catch {
      // error is set in the store
    }
  }

  if (signedUp) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} mb={1}>
          Check your inbox
        </Typography>
        <Alert severity="success" sx={{ mb: 3 }}>
          We sent a confirmation link to <strong>{email}</strong>. Click it to
          activate your account, then sign in.
        </Alert>
        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          fullWidth
          size="large"
        >
          Go to sign in
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        Create your account
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Join SmExPay — it's free
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <TextField
        label="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={!!fieldErrors.fullName}
        helperText={fieldErrors.fullName}
        fullWidth
        autoComplete="name"
        autoFocus
        sx={{ mb: 2 }}
      />

      <TextField
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!fieldErrors.email}
        helperText={fieldErrors.email}
        fullWidth
        autoComplete="email"
        sx={{ mb: 2 }}
      />

      <TextField
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!fieldErrors.password}
        helperText={
          fieldErrors.password ?? "Min 8 chars, one uppercase, one number"
        }
        fullWidth
        autoComplete="new-password"
        sx={{ mb: 2 }}
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

      <TextField
        label="Confirm password"
        type={showPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={!!fieldErrors.confirmPassword}
        helperText={fieldErrors.confirmPassword}
        fullWidth
        autoComplete="new-password"
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
          "Create account"
        )}
      </Button>

      <Divider sx={{ my: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Already have an account?
        </Typography>
      </Divider>

      <Button
        component={RouterLink}
        to="/login"
        variant="outlined"
        fullWidth
        size="large"
      >
        Sign in
      </Button>
    </Box>
  );
}
