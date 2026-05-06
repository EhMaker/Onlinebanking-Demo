import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Alert,
  Box,
  Typography,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Collapse,
} from "@mui/material";
import {
  SwapHorizRounded,
  CheckCircleRounded,
  ErrorRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";
import { useTransfer } from "@/features/banking/hooks/useTransfer";
import { useToast } from "@/hooks/useToast";
import { fetchAccountByNumber } from "@/features/banking/services/accountService";
import { validateAccountNumberFormat } from "@/features/banking/services/transactionService";
import {
  lookupBankByAccountNumber,
  isInternalAccount,
  type BankInfo,
} from "@/features/banking/data/bankRegistry";
import { BankBadge } from "@/features/banking/components/BankBadge";
import type { Account } from "@/types/banking";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DialogStep = "details" | "confirm" | "processing" | "result";

interface TransferDialogProps {
  open: boolean;
  onClose: () => void;
  fromAccount: Account;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STEPS = ["Details", "Confirm", "Processing", "Result"];
const STEP_INDEX: Record<DialogStep, number> = {
  details: 0,
  confirm: 1,
  processing: 2,
  result: 3,
};

function formatMoney(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TransferDialog({
  open,
  onClose,
  fromAccount,
}: TransferDialogProps) {
  const { mutateAsync: transfer, reset: resetMutation } = useTransfer();
  const toast = useToast();

  // form
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmountRaw] = useState("");
  const [description, setDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    toAccountNumber?: string;
    amount?: string;
  }>({});

  // stepper
  const [step, setStep] = useState<DialogStep>("details");
  const [recipient, setRecipient] = useState<Account | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);

  // Bank auto-detection (client-side, instant — no network call)
  const detectedBank: BankInfo | null =
    toAccountNumber.trim().length >= 3
      ? lookupBankByAccountNumber(toAccountNumber.trim())
      : null;
  const isInternal =
    detectedBank?.code === "SMX" || isInternalAccount(toAccountNumber.trim());

  // -------------------------------------------------------------------------
  // Reset + close
  // -------------------------------------------------------------------------

  function resetForm() {
    setToAccountNumber("");
    setAmountRaw("");
    setDescription("");
    setFieldErrors({});
    setLookupError("");
    setLookupLoading(false);
    setRecipient(null);
    setResult(null);
    setStep("details");
    resetMutation();
  }

  function handleClose() {
    if (step === "processing") return; // block close during transfer
    resetForm();
    onClose();
  }

  // -------------------------------------------------------------------------
  // Step 1 → 2  (validate + lookup recipient)
  // -------------------------------------------------------------------------

  async function handleReview() {
    const errors: typeof fieldErrors = {};
    const parsed = parseFloat(amount);

    // Account number format
    const fmtError = validateAccountNumberFormat(toAccountNumber);
    if (fmtError) errors.toAccountNumber = fmtError;
    else if (
      toAccountNumber.trim().toUpperCase() ===
      fromAccount.account_number.toUpperCase()
    )
      errors.toAccountNumber = "You cannot transfer to your own account.";

    // Amount
    if (!amount) {
      errors.amount = "Amount is required.";
    } else if (isNaN(parsed) || parsed <= 0) {
      errors.amount = "Enter a valid amount greater than $0.";
    } else if (parsed < 0.01) {
      errors.amount = "Minimum transfer is $0.01.";
    } else if (parsed > fromAccount.balance) {
      errors.amount = `Insufficient funds. Available: ${formatMoney(fromAccount.balance)}`;
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Live recipient lookup
    setLookupError("");
    setLookupLoading(true);
    let target: Account | null = null;
    try {
      target = await fetchAccountByNumber(toAccountNumber.trim());
    } catch (err) {
      setLookupLoading(false);
      const msg =
        err instanceof Error ? err.message : "Lookup failed. Please retry.";
      setLookupError(msg);
      return;
    }
    setLookupLoading(false);

    if (!target) {
      setLookupError("No account found with that account number.");
      return;
    }

    setRecipient(target);
    setStep("confirm");
  }

  // -------------------------------------------------------------------------
  // Step 2 → 3 → 4  (confirm → processing → result)
  // -------------------------------------------------------------------------

  async function handleConfirm() {
    setStep("processing");

    const res = await transfer({
      fromAccountId: fromAccount.id,
      toAccountNumber: toAccountNumber.trim(),
      amount: parseFloat(amount),
      description: description.trim() || "Transfer",
    }).catch((err: unknown) => ({
      success: false as const,
      message:
        err instanceof Error ? err.message : "Unexpected error. Please retry.",
    }));

    setResult(res);
    setStep("result");
    if (res.success) {
      toast.success(
        `Transfer of $${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} sent successfully`,
      );
    } else {
      toast.error(res.message ?? "Transfer failed");
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const parsedAmount = parseFloat(amount) || 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <SwapHorizRounded color="primary" />
        Send Money
      </DialogTitle>

      {/* Stepper header */}
      <Box sx={{ px: 3, pb: 1 }}>
        <Stepper activeStep={STEP_INDEX[step]} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Divider />

      {/* ------------------------------------------------------------------ */}
      {/* STEP 1 — Details                                                    */}
      {/* ------------------------------------------------------------------ */}
      {step === "details" && (
        <>
          <DialogContent sx={{ pt: 2 }}>
            {/* From account info box */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "action.hover",
                mb: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Sending from
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, fontFamily: "monospace" }}
              >
                {fromAccount.account_number}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Available: {formatMoney(fromAccount.balance)}
              </Typography>
            </Box>

            <Collapse in={!!lookupError}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                {lookupError}
              </Alert>
            </Collapse>

            <TextField
              label="Recipient account number"
              value={toAccountNumber}
              onChange={(e) => {
                setToAccountNumber(e.target.value);
                setLookupError("");
              }}
              error={!!fieldErrors.toAccountNumber}
              helperText={
                fieldErrors.toAccountNumber ??
                "Format: SMX followed by 10 digits"
              }
              fullWidth
              autoComplete="off"
              slotProps={{ htmlInput: { maxLength: 13 } }}
              sx={{ mb: detectedBank ? 1 : 2 }}
            />

            {/* Live bank detection badge */}
            <Collapse in={!!detectedBank} sx={{ mb: detectedBank ? 2 : 0 }}>
              {detectedBank && (
                <BankBadge bank={detectedBank} isInternal={isInternal} />
              )}
            </Collapse>

            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmountRaw(e.target.value)}
              error={!!fieldErrors.amount}
              helperText={fieldErrors.amount}
              fullWidth
              slotProps={{
                htmlInput: { min: 0.01, step: 0.01 },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { maxLength: 100 } }}
              placeholder="e.g. Rent payment"
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button onClick={handleClose} variant="outlined" fullWidth>
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              variant="contained"
              fullWidth
              disabled={lookupLoading}
              endIcon={
                lookupLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <ArrowForwardRounded />
                )
              }
            >
              {lookupLoading ? "Looking up…" : "Review"}
            </Button>
          </DialogActions>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* STEP 2 — Confirm                                                    */}
      {/* ------------------------------------------------------------------ */}
      {step === "confirm" && recipient && (
        <>
          <DialogContent sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please review the details before confirming.
            </Alert>

            {/* Summary box */}
            <Box
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
              }}
            >
              {[
                ["From", fromAccount.account_number],
                ["To", recipient.account_number],
                ["Amount", formatMoney(parsedAmount)],
                ["Description", description.trim() || "Transfer"],
                [
                  "Remaining balance",
                  formatMoney(fromAccount.balance - parsedAmount),
                ],
              ].map(([label, value], i) => (
                <Box
                  key={label}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 2,
                    py: 1,
                    bgcolor: i % 2 === 0 ? "transparent" : "action.hover",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: label === "Amount" ? 700 : 400,
                      fontFamily:
                        label === "From" || label === "To"
                          ? "monospace"
                          : "inherit",
                      color:
                        label === "Amount" ? "primary.main" : "text.primary",
                    }}
                  >
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button
              onClick={() => setStep("details")}
              variant="outlined"
              fullWidth
            >
              Back
            </Button>
            <Button
              onClick={handleConfirm}
              variant="contained"
              color="primary"
              fullWidth
            >
              Confirm &amp; Send
            </Button>
          </DialogActions>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* STEP 3 — Processing                                                 */}
      {/* ------------------------------------------------------------------ */}
      {step === "processing" && (
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 4,
              gap: 2,
            }}
          >
            <CircularProgress size={56} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Processing your transfer…
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Please do not close this window. This may take a moment.
            </Typography>
          </Box>
        </DialogContent>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* STEP 4 — Result                                                     */}
      {/* ------------------------------------------------------------------ */}
      {step === "result" && result && (
        <>
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 3,
                gap: 2,
              }}
            >
              {result.success ? (
                <>
                  <CheckCircleRounded
                    sx={{ fontSize: 64, color: "success.main" }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Transfer Successful!
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center" }}
                  >
                    {formatMoney(parsedAmount)} has been sent to{" "}
                    {recipient?.account_number ?? toAccountNumber}.
                  </Typography>
                </>
              ) : (
                <>
                  <ErrorRounded sx={{ fontSize: 64, color: "error.main" }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Transfer Failed
                  </Typography>
                  <Alert severity="error" sx={{ width: "100%" }}>
                    {result.message ?? "An unexpected error occurred."}
                  </Alert>
                </>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            {!result.success && (
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  resetMutation();
                  setResult(null);
                  setStep("confirm");
                }}
              >
                Try Again
              </Button>
            )}
            <Button
              variant="contained"
              fullWidth
              color={result.success ? "primary" : "inherit"}
              onClick={handleClose}
            >
              {result.success ? "Done" : "Close"}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
