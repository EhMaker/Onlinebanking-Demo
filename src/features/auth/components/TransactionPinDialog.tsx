import { useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { LockRounded } from "@mui/icons-material";
import {
  sendTransactionPinOtp,
  verifyOtpAndSetTransactionPin,
} from "@/features/auth/services/transactionPinService";

interface TransactionPinDialogProps {
  open: boolean;
  email: string;
  isChange: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function TransactionPinDialog({
  open,
  email,
  isChange,
  onClose,
  onComplete,
}: TransactionPinDialogProps) {
  const [step, setStep] = useState<"pin" | "otp">("pin");
  const [pin, setPin] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function reset() {
    setStep("pin");
    setPin("");
    setConfirmation("");
    setOtp("");
    setError("");
    setIsLoading(false);
  }

  function close() {
    reset();
    onClose();
  }

  async function sendCode() {
    if (!/^\d{4,6}$/.test(pin)) {
      setError("PIN must contain 4 to 6 digits.");
      return;
    }
    if (pin !== confirmation) {
      setError("PIN entries do not match.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await sendTransactionPinOtp(email);
      setStep("otp");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to send OTP.");
    } finally {
      setIsLoading(false);
    }
  }

  async function complete() {
    if (!/^\d{8}$/.test(otp)) {
      setError("Enter the 8-digit code sent to your email.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await verifyOtpAndSetTransactionPin(email, otp, pin);
      reset();
      onComplete();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to verify OTP.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={close} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <LockRounded color="primary" />
        {isChange ? "Change transaction PIN" : "Set transaction PIN"}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {step === "pin"
            ? "Create a 4 to 6 digit PIN. We will send a verification code to your email."
            : `Enter the verification code sent to ${email}.`}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {step === "pin" ? (
          <>
            <TextField
              label="Transaction PIN"
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
              slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 6 } }}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Confirm transaction PIN"
              type="password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value.replace(/\D/g, "").slice(0, 6))}
              slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 6 } }}
              fullWidth
            />
          </>
        ) : (
          <TextField
            label="Email verification code"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 8))}
            slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 8 } }}
            fullWidth
            autoFocus
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={isLoading}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => void (step === "pin" ? sendCode() : complete())}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={20} color="inherit" /> : step === "pin" ? "Send OTP" : "Verify and save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
