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
import { verifyTransactionPin } from "@/features/auth/services/transactionPinService";

interface VerifyTransactionPinDialogProps {
  open: boolean;
  onClose: () => void;
  onVerified: (pin: string) => void;
}

export function VerifyTransactionPinDialog({
  open,
  onClose,
  onVerified,
}: VerifyTransactionPinDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit() {
    if (!/^\d{4,6}$/.test(pin)) {
      setError("Enter your 4 to 6 digit transaction PIN.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      if (!(await verifyTransactionPin(pin))) {
        setError("Incorrect transaction PIN.");
        return;
      }
      setPin("");
      onVerified(pin);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to verify PIN.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <LockRounded color="primary" />
        Confirm transaction PIN
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter your PIN to authorize this transfer.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label="Transaction PIN"
          type="password"
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
          slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 6 } }}
          fullWidth
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button variant="contained" onClick={() => void submit()} disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} color="inherit" /> : "Authorize transfer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
