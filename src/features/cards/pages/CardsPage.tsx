import { useState, useEffect } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/motion/AnimatedList";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  Collapse,
  Chip,
  Divider,
  Tooltip,
  Grid,
  Skeleton,
} from "@mui/material";
import {
  CreditCardRounded,
  AccountBalanceRounded,
  VisibilityRounded,
  VisibilityOffRounded,
  CheckCircleRounded,
  CancelRounded,
  ContentCopyRounded,
  ShoppingCartRounded,
  TrendingDownRounded,
} from "@mui/icons-material";
import { CardItem, CATEGORY_ICONS } from "@/features/cards/components/CardItem";
import { SimulateTransactionDialog } from "@/features/cards/components/SimulateTransactionDialog";
import { useCardStore } from "@/features/cards/store/cardStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useAccount } from "@/features/banking/hooks/useAccount";
import type { Card } from "@/types/banking";
import {
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  validateCard,
  type CardValidationResult,
} from "@/features/banking/utils/luhn";
import {
  validateIBAN,
  formatIBAN,
  type IBANResult,
} from "@/features/banking/utils/iban";
import { CardPreview } from "@/features/cards/components/CardPreview";

// ---------------------------------------------------------------------------
// My Cards panel
// ---------------------------------------------------------------------------

function MyCardsPanel() {
  const { user, profile } = useAuthStore();
  const { data: account, isLoading } = useAccount();
  const { initCards, getCards, getAllTransactions } = useCardStore();
  const [simulateTarget, setSimulateTarget] = useState<Card | null>(null);

  useEffect(() => {
    if (!user || !account) return;
    const name =
      profile?.full_name?.trim() ||
      user.email?.split("@")[0].toUpperCase() ||
      "CARD HOLDER";
    initCards(user.id, account.id, name);
  }, [user, account, profile, initCards]);

  if (isLoading || !account) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {[0, 1].map((i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={180}
            sx={{ borderRadius: 3 }}
          />
        ))}
      </Box>
    );
  }

  const cards = user ? getCards(user.id) : [];
  const allTx = user ? getAllTransactions(user.id) : [];

  const now = new Date();
  const monthlyTx = allTx.filter((tx) => {
    const d = new Date(tx.createdAt);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });
  const monthlySpent = monthlyTx
    .filter((tx) => tx.status === "approved")
    .reduce((s, tx) => s + tx.amount, 0);
  const declined = monthlyTx.filter((tx) => tx.status === "declined").length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Stats */}
      <Grid container spacing={2}>
        {[
          {
            label: "Cards",
            value: cards.length,
            icon: <CreditCardRounded />,
            color: "primary.main",
          },
          {
            label: "Spent this month",
            value: `$${monthlySpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            icon: <TrendingDownRounded />,
            color: "error.main",
          },
          {
            label: "Transactions",
            value: allTx.length,
            icon: <ShoppingCartRounded />,
            color: "success.main",
          },
          {
            label: "Declined",
            value: declined,
            icon: <CancelRounded />,
            color: "warning.main",
          },
        ].map((stat) => (
          <Grid key={stat.label} size={{ xs: 6, sm: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  color: stat.color,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                }}
              >
                {stat.icon}
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {stat.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Cards list */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <AnimatedList>
          {cards.map((card) => (
            <AnimatedListItem key={card.id}>
              <CardItem card={card} onSimulate={setSimulateTarget} />
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </Box>

      {simulateTarget && (
        <SimulateTransactionDialog
          open={!!simulateTarget}
          onClose={() => setSimulateTarget(null)}
          card={simulateTarget}
          accountBalance={account.balance}
        />
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Card Transactions panel
// ---------------------------------------------------------------------------

function CardTransactionsPanel() {
  const { user } = useAuthStore();
  const { getAllTransactions, getCards } = useCardStore();

  const allTx = user ? getAllTransactions(user.id) : [];
  const cards = user ? getCards(user.id) : [];
  const cardNameMap = Object.fromEntries(cards.map((c) => [c.id, c.nickname]));

  if (allTx.length === 0) {
    return (
      <Box
        sx={{
          py: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          color: "text.secondary",
        }}
      >
        <ShoppingCartRounded sx={{ fontSize: 48, opacity: 0.3 }} />
        <Typography variant="body2">No card transactions yet</Typography>
        <Typography variant="caption">
          Go to <strong>My Cards</strong> and hit <strong>Pay</strong> to
          simulate a purchase
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <AnimatedList>
        {allTx.map((tx) => (
          <AnimatedListItem key={tx.id}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor:
                    tx.status === "approved"
                      ? "primary.main" + "18"
                      : "action.disabledBackground",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                  flexShrink: 0,
                }}
              >
                {CATEGORY_ICONS[tx.category] ?? "📋"}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tx.merchant}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {cardNameMap[tx.cardId] ?? tx.cardId.slice(-8)} ·{" "}
                  {new Date(tx.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color:
                      tx.status === "approved" ? "error.main" : "text.disabled",
                    textDecoration:
                      tx.status === "declined" ? "line-through" : "none",
                  }}
                >
                  -{tx.currency}{" "}
                  {tx.amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
                <Chip
                  label={tx.status}
                  size="small"
                  color={tx.status === "approved" ? "success" : "error"}
                  sx={{ fontSize: "0.65rem", height: 18, mt: 0.25 }}
                />
              </Box>
            </Paper>
          </AnimatedListItem>
        ))}
      </AnimatedList>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Tab panel helper
// ---------------------------------------------------------------------------

function TabPanel({
  value,
  index,
  children,
}: {
  value: number;
  index: number;
  children: React.ReactNode;
}) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

// ---------------------------------------------------------------------------
// Card Validator panel
// ---------------------------------------------------------------------------

function CardValidator() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [result, setResult] = useState<CardValidationResult | null>(null);

  const brand = detectCardBrand(cardNumber);
  const formattedNumber = formatCardNumber(cardNumber, brand.brand);

  function handleCardNumberChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 19);
    setCardNumber(digits);
    setResult(null);
  }

  function handleExpiryChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    setExpiry(digits);
    setResult(null);
  }

  function handleValidate() {
    setResult(validateCard(cardNumber, expiry, cvv, name));
  }

  function handleReset() {
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setName("");
    setResult(null);
    setFlipped(false);
  }

  return (
    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
      {/* Left — card preview */}
      <Box
        sx={{
          flex: "1 1 320px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <CardPreview
          cardNumber={formattedNumber}
          cardholderName={name}
          expiry={formatExpiry(expiry)}
          brand={brand}
          flipped={flipped}
          cvv={cvv}
        />
        <Button
          variant="text"
          size="small"
          onClick={() => setFlipped((f) => !f)}
          sx={{ opacity: 0.7 }}
        >
          {flipped ? "Show front" : "Show back (CVV)"}
        </Button>

        {/* Brand + Luhn quick indicator */}
        {cardNumber.replace(/\D/g, "").length >= 4 && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Chip
              label={brand.label}
              size="small"
              sx={{
                fontWeight: 700,
                background: brand.gradient[0],
                color: "#fff",
              }}
            />
            {cardNumber.replace(/\D/g, "").length >= 12 && (
              <Chip
                icon={
                  result ? (
                    result.luhnValid ? (
                      <CheckCircleRounded
                        sx={{ fontSize: "16px !important" }}
                      />
                    ) : (
                      <CancelRounded sx={{ fontSize: "16px !important" }} />
                    )
                  ) : undefined
                }
                label={
                  result
                    ? result.luhnValid
                      ? "Luhn ✓"
                      : "Luhn ✗"
                    : "Luhn pending"
                }
                size="small"
                color={
                  result ? (result.luhnValid ? "success" : "error") : "default"
                }
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Box>

      {/* Right — form */}
      <Box
        sx={{
          flex: "1 1 300px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <TextField
          label="Card Number"
          value={formattedNumber}
          onChange={(e) => handleCardNumberChange(e.target.value)}
          placeholder="1234 5678 9012 3456"
          fullWidth
          slotProps={{
            htmlInput: { inputMode: "numeric" },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <CreditCardRounded sx={{ color: brand.gradient[0] }} />
                </InputAdornment>
              ),
            },
          }}
          error={!!result?.errors.cardNumber}
          helperText={result?.errors.cardNumber}
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Expiry (MM/YY)"
            value={formatExpiry(expiry)}
            onChange={(e) => handleExpiryChange(e.target.value)}
            placeholder="MM/YY"
            fullWidth
            slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 5 } }}
            error={!!result?.errors.expiry}
            helperText={result?.errors.expiry}
          />
          <TextField
            label={`CVV (${brand.cvvLength} digits)`}
            value={cvv}
            onChange={(e) => {
              setCvv(
                e.target.value.replace(/\D/g, "").slice(0, brand.cvvLength),
              );
              setResult(null);
            }}
            onFocus={() => setFlipped(true)}
            onBlur={() => setFlipped(false)}
            placeholder={"•".repeat(brand.cvvLength)}
            type={showCvv ? "text" : "password"}
            fullWidth
            slotProps={{
              htmlInput: { inputMode: "numeric", maxLength: brand.cvvLength },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCvv((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {showCvv ? (
                        <VisibilityOffRounded />
                      ) : (
                        <VisibilityRounded />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            error={!!result?.errors.cvv}
            helperText={result?.errors.cvv}
          />
        </Box>

        <TextField
          label="Cardholder Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setResult(null);
          }}
          placeholder="As it appears on the card"
          fullWidth
          slotProps={{ htmlInput: { maxLength: 60 } }}
          error={!!result?.errors.name}
          helperText={result?.errors.name}
        />

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="contained" fullWidth onClick={handleValidate}>
            Validate Card
          </Button>
          <Button variant="outlined" onClick={handleReset}>
            Reset
          </Button>
        </Box>

        {/* Validation result */}
        <Collapse in={!!result}>
          {result && (
            <Alert
              severity={result.valid ? "success" : "error"}
              icon={result.valid ? <CheckCircleRounded /> : <CancelRounded />}
            >
              {result.valid
                ? `Valid ${result.brand.label} card — passed all checks including Luhn algorithm.`
                : "Card validation failed. See field errors above."}
            </Alert>
          )}
        </Collapse>

        {/* Info box */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: "action.hover",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            The <strong>Luhn algorithm</strong> (ISO/IEC 7812) is a checksum
            formula used to validate card numbers. It detects single-digit
            errors and most transposition errors. Real card processing also
            verifies the card against the issuer — this tool simulates the
            client-side check only.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// IBAN Validator panel
// ---------------------------------------------------------------------------

function IBANValidator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<IBANResult | null>(null);
  const [copied, setCopied] = useState(false);

  function handleValidate() {
    setResult(validateIBAN(input));
  }

  function handleCopy() {
    if (result?.formatted) {
      void navigator.clipboard.writeText(result.formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const liveFormatted = input.trim().length >= 4 ? formatIBAN(input) : "";

  // Country of entered IBAN (first 2 letters) to show flag emoji
  const COUNTRY_FLAG: Record<string, string> = {
    GB: "🇬🇧",
    DE: "🇩🇪",
    FR: "🇫🇷",
    IT: "🇮🇹",
    ES: "🇪🇸",
    NL: "🇳🇱",
    BE: "🇧🇪",
    CH: "🇨🇭",
    AT: "🇦🇹",
    SE: "🇸🇪",
    NO: "🇳🇴",
    DK: "🇩🇰",
    FI: "🇫🇮",
    PT: "🇵🇹",
    GR: "🇬🇷",
    PL: "🇵🇱",
    CZ: "🇨🇿",
    HU: "🇭🇺",
    RO: "🇷🇴",
    HR: "🇭🇷",
    TR: "🇹🇷",
    SA: "🇸🇦",
    AE: "🇦🇪",
    QA: "🇶🇦",
    KW: "🇰🇼",
    BH: "🇧🇭",
    EG: "🇪🇬",
    ZA: "🇿🇦",
    US: "🇺🇸",
    BR: "🇧🇷",
    UA: "🇺🇦",
  };

  const countryCode = input.trim().slice(0, 2).toUpperCase();
  const flag = COUNTRY_FLAG[countryCode] ?? "🏳️";

  return (
    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
      {/* Input column */}
      <Box
        sx={{
          flex: "1 1 320px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <TextField
          label="IBAN"
          value={input}
          onChange={(e) => {
            setInput(e.target.value.toUpperCase());
            setResult(null);
          }}
          placeholder="e.g. GB82 WEST 1234 5698 7654 32"
          fullWidth
          slotProps={{
            htmlInput: { maxLength: 46 },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <AccountBalanceRounded />
                </InputAdornment>
              ),
            },
          }}
          helperText={
            liveFormatted
              ? `Formatted: ${liveFormatted}`
              : "Enter an IBAN to validate"
          }
        />

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="contained" fullWidth onClick={handleValidate}>
            Validate IBAN
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setInput("");
              setResult(null);
            }}
          >
            Clear
          </Button>
        </Box>

        <Collapse in={!!result}>
          {result && (
            <Alert severity={result.valid ? "success" : "error"}>
              {result.valid ? (
                <>
                  <strong>Valid IBAN</strong> — {flag} {result.countryName}
                  <br />
                  BBAN: <code>{result.bban}</code>
                </>
              ) : (
                result.error
              )}
            </Alert>
          )}
        </Collapse>

        {/* Formatted output card (shown on success) */}
        {result?.valid && result.formatted && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "success.main",
              bgcolor: "success.main" + "0a",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.5 }}
            >
              Formatted IBAN
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  letterSpacing: "0.1em",
                  flex: 1,
                }}
              >
                {result.formatted}
              </Typography>
              <Tooltip title={copied ? "Copied!" : "Copy"}>
                <IconButton size="small" onClick={handleCopy}>
                  <ContentCopyRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {[
                [
                  "Country",
                  `${flag} ${result.countryName} (${result.countryCode})`,
                ],
                ["Check digits", result.formatted.slice(2, 4)],
                ["BBAN", result.bban ?? "—"],
              ].map(([label, value]) => (
                <Box key={label}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        )}
      </Box>

      {/* Info column */}
      <Box
        sx={{
          flex: "1 1 260px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "action.hover",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            How IBAN Validation Works
          </Typography>
          {[
            [
              "1. Format check",
              "Country code prefix is matched against 70+ registered countries and the IBAN is checked to be the correct length for that country.",
            ],
            [
              "2. Rearrangement",
              "The first 4 characters (country code + check digits) are moved to the end of the string.",
            ],
            [
              "3. Numeric conversion",
              "Each letter is replaced by digits (A=10, B=11 … Z=35) to form a long number string.",
            ],
            [
              "4. Mod-97 check",
              "The resulting number is divided by 97. A valid IBAN always yields a remainder of 1.",
            ],
          ].map(([title, desc]) => (
            <Box key={title as string} sx={{ mb: 1.5 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "primary.main" }}
              >
                {title}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                {desc}
              </Typography>
            </Box>
          ))}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "action.hover",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Sample IBANs (for testing)
          </Typography>
          {[
            ["🇬🇧 UK", "GB82 WEST 1234 5698 7654 32"],
            ["🇩🇪 Germany", "DE89 3704 0044 0532 0130 00"],
            ["🇫🇷 France", "FR76 3000 6000 0112 3456 7890 189"],
            ["🇳🇱 Netherlands", "NL91 ABNA 0417 1643 00"],
          ].map(([country, iban]) => (
            <Box
              key={country as string}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.75,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {country}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                  {iban}
                </Typography>
                <Tooltip title="Use this IBAN">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setInput((iban as string).replace(/\s/g, ""));
                      setResult(null);
                    }}
                    sx={{ p: 0.25 }}
                  >
                    <ContentCopyRounded sx={{ fontSize: 13 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Paper>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function CardsPage() {
  const [tab, setTab] = useState(0);

  return (
    <PageTransition>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <CreditCardRounded color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Cards
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}
        >
          <Tabs
            value={tab}
            onChange={(_, v: number) => setTab(v)}
            sx={{ borderBottom: "1px solid", borderColor: "divider", px: 2 }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="My Cards" />
            <Tab label="Transactions" />
            <Tab
              label="Card Validator"
              icon={<CreditCardRounded />}
              iconPosition="start"
            />
            <Tab
              label="IBAN Validator"
              icon={<AccountBalanceRounded />}
              iconPosition="start"
            />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <TabPanel value={tab} index={0}>
              <MyCardsPanel />
            </TabPanel>
            <TabPanel value={tab} index={1}>
              <CardTransactionsPanel />
            </TabPanel>
            <TabPanel value={tab} index={2}>
              <CardValidator />
            </TabPanel>
            <TabPanel value={tab} index={3}>
              <IBANValidator />
            </TabPanel>
          </Box>
        </Paper>
      </Box>
    </PageTransition>
  );
}
