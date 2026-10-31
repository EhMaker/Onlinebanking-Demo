import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Divider,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { VisibilityRounded, VisibilityOffRounded } from "@mui/icons-material";
import { useAuthStore } from "@/features/auth/store/authStore";

export function SignupPage() {
  const { signup, isLoading, error, clearError } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [nationality, setNationality] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    nationality?: string;
    gender?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  function validate() {
    const errors: typeof fieldErrors = {};
    if (!fullName.trim()) errors.fullName = "Full name is required.";
    if (!phoneNumber.trim()) errors.phoneNumber = "Phone number is required.";
    else if (!/^[+]?[\d\s().-]{7,20}$/.test(phoneNumber.trim()))
      errors.phoneNumber = "Enter a valid phone number.";
    if (!dateOfBirth) errors.dateOfBirth = "Date of birth is required.";
    else if (
      Number.isNaN(new Date(dateOfBirth).getTime()) ||
      new Date(dateOfBirth) > new Date()
    )
      errors.dateOfBirth = "Enter a valid date of birth.";
    if (!address.trim()) errors.address = "Address is required.";
    if (!city.trim()) errors.city = "City is required.";
    if (!state.trim()) errors.state = "State is required.";
    if (!postalCode.trim()) errors.postalCode = "Postal code is required.";
    else if (!/^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/.test(postalCode.trim()))
      errors.postalCode = "Enter a valid postal code.";
    if (!nationality.trim()) errors.nationality = "Nationality is required.";
    if (!gender) errors.gender = "Gender is required.";
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
      await signup({
        email,
        password,
        fullName,
        phoneNumber,
        dateOfBirth,
        address,
        city,
        state,
        postalCode,
        nationality,
        gender,
      });
      setSignedUp(true);
    } catch {
      // error is set in the store
    }
  }

  if (signedUp) {
    return (
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
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
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Create your account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Join Jeonbuuk Bank — it's free
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
          mb: 2,
        }}
      >
        <TextField
          label="Phone number"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          error={!!fieldErrors.phoneNumber}
          helperText={fieldErrors.phoneNumber}
          fullWidth
          autoComplete="tel"
        />

        <TextField
          label="Date of birth"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          error={!!fieldErrors.dateOfBirth}
          helperText={fieldErrors.dateOfBirth}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          error={!!fieldErrors.address}
          helperText={fieldErrors.address}
          fullWidth
          autoComplete="street-address"
          sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}
        />

        <TextField
          label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          error={!!fieldErrors.city}
          helperText={fieldErrors.city}
          fullWidth
          autoComplete="address-level2"
        />

        <TextField
          label="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          error={!!fieldErrors.state}
          helperText={fieldErrors.state}
          fullWidth
          autoComplete="address-level1"
        />

        <TextField
          label="Postal code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          error={!!fieldErrors.postalCode}
          helperText={fieldErrors.postalCode}
          fullWidth
          autoComplete="postal-code"
        />

        <TextField
          label="Nationality"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          error={!!fieldErrors.nationality}
          helperText={fieldErrors.nationality}
          fullWidth
          autoComplete="country-name"
        />

        <TextField
          select
          label="Gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          error={!!fieldErrors.gender}
          helperText={fieldErrors.gender}
          fullWidth
        >
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="non_binary">Non-binary</MenuItem>
          <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
        </TextField>
      </Box>

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
