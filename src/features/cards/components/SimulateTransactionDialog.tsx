import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  CheckCircleRounded,
  CancelRounded,
  PaymentRounded,
} from "@mui/icons-material";
import type { Card, CardTxCategory } from "@/types/banking";
import { useCardStore } from "@/features/cards/store/cardStore";
import { CATEGORY_ICONS } from "@/features/cards/components/CardItem";
import { useToast } from "@/hooks/useToast";
import { maskCardNumber } from "@/features/cards/utils/cardGenerator";

// ---------------------------------------------------------------------------
// Per-category merchant suggestions
// ---------------------------------------------------------------------------

const MERCHANTS: Record<CardTxCategory, string[]> = {
  shopping: ["Amazon", "Walmart", "Target", "Best Buy", "IKEA"],
  dining: ["McDonald's", "Starbucks", "Pizza Hut", "Chipotle", "Olive Garden"],
  travel: ["Uber", "Delta Airlines", "Airbnb", "Booking.com", "Lyft"],
  entertainment: [
    "Netflix",
    "Spotify",
    "AMC Theatres",
    "Steam",
    "PlayStation Store",
  ],
  utilities: ["AT&T", "Xfinity", "Con Edison", "T-Mobile", "Verizon"],
  healthcare: [
    "CVS Pharmacy",
    "Walgreens",
    "LabCorp",
    "Urgent Care",
    "Rite Aid",
  ],
  fuel: ["Shell", "Chevron", "ExxonMobil", "BP", "Valero"],
  other: ["Apple Pay", "Google Pay", "PayPal", "Venmo", "Square"],
};

const CATEGORIES: { value: CardTxCategory; label: string }[] = [
  { value: "shopping", label: "Shopping" },
  { value: "dining", label: "Dining" },
  { value: "travel", label: "Travel" },
  { value: "entertainment", label: "Entertainment" },
  { value: "utilities", label: "Utilities" },
  { value: "healthcare", label: "Healthcare" },
  { value: "fuel", label: "Fuel" },
  { value: "other", label: "Other" },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SimulateTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  card: Card;
  accountBalance: number;
}

type Step = "form" | "processing" | "result";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SimulateTransactionDialog({
  open,
  onClose,
  card,
  accountBalance,
}: SimulateTransactionDialogProps) {
  const { simulatePurchase, getCardTransactions } = useCardStore();
  const toast = useToast();

  const [category, setCategory] = useState<CardTxCategory>("shopping");
  const [merchant, setMerchant] = useState(MERCHANTS.shopping[0]);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [result, setResult] = useState<{
    approved: boolean;
    reason?: string;
  } | null>(null);
  const [validationError, setValidationError] = useState("");

  function handleCategoryChange(value: CardTxCategory) {
    setCategory(value);
    setMerchant(MERCHANTS[value][0]);
    setValidationError("");
  }

  function validate() {
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) {
      setValidationError("Enter a valid amount greater than $0");
      return false;
    }
    if (val > 50000) {
      setValidationError("Amount cannot exceed $50,000");
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setStep("processing");

    // Short simulated delay
    await new Promise((r) => setTimeout(r, 900));

    const res = simulatePurchase({
      card,
      merchant: merchant.trim() || "Unknown Merchant",
      category,
      amount: parseFloat(amount),
      accountBalance,
    });

    setResult(res);
    setStep("result");
    if (res.approved) {
      toast.success(`Payment to ${merchant} approved`);
    } else {
      toast.error(`Payment declined: ${res.reason ?? "insufficient funds"}`);
    }
  }

  function handleClose() {
    onClose();
    // Reset after exit animation
    setTimeout(() => {
      setStep("form");
      setResult(null);
      setAmount("");
      setCategory("shopping");
      setMerchant(MERCHANTS.shopping[0]);
      setValidationError("");
    }, 300);
  }

  const amountNum = parseFloat(amount) || 0;
  const monthlySpent = getCardTransactions(card.id)
    .filter((tx) => {
      if (tx.status !== "approved") return false;
      const txDate = new Date(tx.createdAt);
      const now = new Date();
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <Dialog
      open={open}
      onClose={step === "processing" ? undefined : handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Simulate Card Payment
      </DialogTitle>

      <DialogContent>
        {/* ---- FORM ---- */}
        {step === "form" && (
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Card summary */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: "action.hover",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <PaymentRounded color="primary" />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {card.nickname}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: "monospace" }}
                >
                  {maskCardNumber(card.number)}
                </Typography>
              </Box>
              <Box sx={{ ml: "auto", textAlign: "right" }}>
                <Typography variant="caption" color="text.secondary">
                  Balance
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  $
                  {accountBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              </Box>
            </Box>

            {/* Category */}
            <TextField
              select
              label="Category"
              value={category}
              onChange={(e) =>
                handleCategoryChange(e.target.value as CardTxCategory)
              }
              size="small"
              fullWidth
            >
              {CATEGORIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span>{CATEGORY_ICONS[c.value]}</span>
                    <span>{c.label}</span>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {/* Merchant */}
            <TextField
              select
              label="Merchant"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              size="small"
              fullWidth
            >
              {MERCHANTS[category].map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>

            {/* Amount */}
            <TextField
              label="Amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setValidationError("");
              }}
              size="small"
              fullWidth
              type="number"
              slotProps={{
                input: {
                  startAdornment: (
                    <Typography sx={{ mr: 0.5, color: "text.secondary" }}>
                      $
                    </Typography>
                  ),
                },
                htmlInput: { min: 0.01, step: 0.01 },
              }}
              error={!!validationError}
              helperText={validationError}
            />

            {/* Spending info */}
            {card.spendingLimit !== null && (
              <Alert severity="info" sx={{ py: 0.5 }}>
                Monthly limit: ${card.spendingLimit.toLocaleString()} · Used: $
                {monthlySpent.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </Alert>
            )}
          </Box>
        )}

        {/* ---- PROCESSING ---- */}
        {step === "processing" && (
          <Box
            sx={{
              py: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <CircularProgress size={48} />
            <Typography variant="body2" color="text.secondary">
              Processing payment to <strong>{merchant}</strong>…
            </Typography>
          </Box>
        )}

        {/* ---- RESULT ---- */}
        {step === "result" && result && (
          <Box sx={{ py: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              {result.approved ? (
                <CheckCircleRounded
                  sx={{ fontSize: 56, color: "success.main" }}
                />
              ) : (
                <CancelRounded sx={{ fontSize: 56, color: "error.main" }} />
              )}
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {result.approved ? "Payment Approved" : "Payment Declined"}
              </Typography>
              {!result.approved && result.reason && (
                <Chip label={result.reason} color="error" size="small" />
              )}
            </Box>

            <Divider />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">
                  Merchant
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {merchant}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body2">
                  {CATEGORY_ICONS[category]}{" "}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">
                  Amount
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: result.approved ? "error.main" : "text.disabled",
                  }}
                >
                  {result.approved ? "-" : ""}$
                  {amountNum.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">
                  Card
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                  {maskCardNumber(card.number)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {step === "form" && (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => void handleSubmit()}
              disabled={!amount}
            >
              Confirm &amp; Pay
            </Button>
          </>
        )}
        {step === "result" && (
          <>
            {result?.approved && (
              <Button
                onClick={() => {
                  setStep("form");
                  setResult(null);
                  setAmount("");
                }}
              >
                New Payment
              </Button>
            )}
            <Button variant="contained" onClick={handleClose}>
              Done
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
