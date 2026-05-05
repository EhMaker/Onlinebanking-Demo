import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { VisibilityRounded, VisibilityOffRounded } from "@mui/icons-material";
import { useAuthStore } from "@/features/auth/store/authStore";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const {
    updatePassword,
    isPasswordRecovery,
    isInitialized,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirm?: string;
  }>({});

  // Wait for auth to initialize before deciding whether to allow access.
  if (!isInitialized) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 6,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If the user didn't land here from a reset email, send them to login.
  if (!isPasswordRecovery) {
    return <Navigate to="/login" replace />;
  }

  function validate() {
    const errors: typeof fieldErrors = {};
    if (!password) errors.password = "Password is required.";
    else if (password.length < 8)
      errors.password = "Password must be at least 8 characters.";
    else if (!/[A-Z]/.test(password))
      errors.password = "Include at least one uppercase letter.";
    else if (!/[0-9]/.test(password))
      errors.password = "Include at least one number.";
    if (confirmPassword !== password)
      errors.confirm = "Passwords do not match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    try {
      await updatePassword(password);
      navigate("/dashboard", { replace: true });
    } catch {
      // error is set in the store
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Set new password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter a strong new password for your account.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      <TextField
        label="New password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!fieldErrors.password}
        helperText={
          fieldErrors.password ?? "Min 8 chars, one uppercase, one number"
        }
        fullWidth
        autoComplete="new-password"
        autoFocus
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
        label="Confirm new password"
        type={showPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={!!fieldErrors.confirm}
        helperText={fieldErrors.confirm}
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
      >
        {isLoading ? (
          <CircularProgress size={22} color="inherit" />
        ) : (
          "Update password"
        )}
      </Button>
    </Box>
  );
}
