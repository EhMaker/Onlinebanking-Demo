import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  Button,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  VisibilityRounded,
  VisibilityOffRounded,
  ContentCopyRounded,
  AcUnitRounded,
  WbSunnyRounded,
  PaymentRounded,
  EditRounded,
  CheckRounded,
} from "@mui/icons-material";
import type { Card } from "@/types/banking";
import {
  maskCardNumber,
  formatFullCardNumber,
} from "@/features/cards/utils/cardGenerator";
import { useCardStore } from "@/features/cards/store/cardStore";
import { useToast } from "@/hooks/useToast";

// ---------------------------------------------------------------------------
// Network logo (text-based SVG placeholder)
// ---------------------------------------------------------------------------

function NetworkBadge({ network }: { network: Card["network"] }) {
  if (network === "visa") {
    return (
      <Typography
        sx={{
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: "1rem",
          color: "#1A1F71",
          letterSpacing: "-1px",
          lineHeight: 1,
        }}
      >
        VISA
      </Typography>
    );
  }
  return (
    <Box sx={{ display: "flex", gap: "-4px" }}>
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          bgcolor: "#EB001B",
          opacity: 0.9,
        }}
      />
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          bgcolor: "#F79E1B",
          ml: "-8px",
          opacity: 0.9,
        }}
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Status chip
// ---------------------------------------------------------------------------

const STATUS_COLOR: Record<Card["status"], "success" | "warning" | "error"> = {
  active: "success",
  frozen: "warning",
  blocked: "error",
};

// ---------------------------------------------------------------------------
// Category icon map (emoji for simplicity)
// ---------------------------------------------------------------------------

export const CATEGORY_ICONS: Record<string, string> = {
  shopping: "🛍️",
  dining: "🍽️",
  travel: "✈️",
  entertainment: "🎬",
  utilities: "💡",
  healthcare: "🏥",
  fuel: "⛽",
  other: "📋",
};

// ---------------------------------------------------------------------------
// CardItem component
// ---------------------------------------------------------------------------

interface CardItemProps {
  card: Card;
  onSimulate: (card: Card) => void;
}

export function CardItem({ card, onSimulate }: CardItemProps) {
  const { setCardStatus, renameCard, setSpendingLimit } = useCardStore();
  const toast = useToast();

  const [revealed, setRevealed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(card.nickname);
  const [limitDraft, setLimitDraft] = useState(
    card.spendingLimit !== null ? String(card.spendingLimit) : "",
  );

  const isFrozen = card.status === "frozen";
  const isBlocked = card.status === "blocked";

  function handleCopy() {
    void navigator.clipboard.writeText(card.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleToggleFreeze() {
    if (isBlocked) return;
    const next = isFrozen ? "active" : "frozen";
    setCardStatus(card.id, next);
    toast.info(
      next === "frozen"
        ? `${card.nickname} frozen`
        : `${card.nickname} unfrozen`,
    );
  }

  function handleSaveName() {
    if (draftName.trim()) {
      renameCard(card.id, draftName.trim());
      toast.success("Card renamed");
    }
    setEditingName(false);
  }

  function handleSaveLimit() {
    const parsed = parseFloat(limitDraft);
    const limit = isNaN(parsed) || parsed <= 0 ? null : parsed;
    setSpendingLimit(card.id, limit);
    toast.success(
      limit
        ? `Spending limit set to $${limit.toLocaleString()}`
        : "Spending limit removed",
    );
  }

  // Gradient based on network
  const gradient =
    card.network === "visa"
      ? "linear-gradient(135deg, #1B4FD8, #1565C0)"
      : "linear-gradient(135deg, #eb3349, #f45c43)";

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: isFrozen
          ? "warning.main"
          : isBlocked
            ? "error.main"
            : "divider",
        overflow: "hidden",
        opacity: isBlocked ? 0.7 : 1,
      }}
    >
      {/* Card visual strip */}
      <Box
        sx={{
          background: isFrozen
            ? "linear-gradient(135deg, #607D8B, #90A4AE)"
            : gradient,
          px: 3,
          py: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          color: "#fff",
          position: "relative",
        }}
      >
        {/* Top row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            {editingName ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  size="small"
                  variant="standard"
                  slotProps={{
                    input: {
                      sx: {
                        color: "#fff",
                        "&:before": { borderColor: "#fff8" },
                      },
                    },
                    htmlInput: { maxLength: 30 },
                  }}
                  sx={{ width: 160 }}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  autoFocus
                />
                <IconButton
                  size="small"
                  onClick={handleSaveName}
                  sx={{ color: "#fff" }}
                >
                  <CheckRounded fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  {card.nickname}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setEditingName(true)}
                  sx={{ color: "#ffffffaa", p: 0.25 }}
                >
                  <EditRounded sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            )}
          </Box>
          <NetworkBadge network={card.network} />
        </Box>

        {/* Card number */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: "1rem",
              letterSpacing: "0.1em",
              fontWeight: 600,
            }}
          >
            {revealed
              ? formatFullCardNumber(card.number)
              : maskCardNumber(card.number)}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5, ml: "auto" }}>
            <Tooltip title={revealed ? "Hide" : "Reveal"}>
              <IconButton
                size="small"
                onClick={() => setRevealed((v) => !v)}
                sx={{ color: "#ffffffcc" }}
              >
                {revealed ? (
                  <VisibilityOffRounded fontSize="small" />
                ) : (
                  <VisibilityRounded fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title={copied ? "Copied!" : "Copy number"}>
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{ color: "#ffffffcc" }}
              >
                <ContentCopyRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Bottom row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "0.6rem",
                opacity: 0.7,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Cardholder
            </Typography>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.8rem",
                letterSpacing: "0.05em",
              }}
            >
              {card.cardholderName.toUpperCase()}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              sx={{
                fontSize: "0.6rem",
                opacity: 0.7,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Expires
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
              {card.expiry}
            </Typography>
          </Box>
        </Box>

        {/* Frozen overlay */}
        {isFrozen && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <AcUnitRounded sx={{ fontSize: 64, color: "#ffffff33" }} />
          </Box>
        )}
      </Box>

      {/* Action bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          bgcolor: "action.hover",
          borderTop: "1px solid",
          borderColor: "divider",
          flexWrap: "wrap",
        }}
      >
        <Chip
          label={card.status.charAt(0).toUpperCase() + card.status.slice(1)}
          size="small"
          color={STATUS_COLOR[card.status]}
          sx={{ fontWeight: 700 }}
        />
        <Chip
          label={card.network.charAt(0).toUpperCase() + card.network.slice(1)}
          size="small"
          variant="outlined"
        />
        <Box sx={{ flex: 1 }} />

        {!isBlocked && (
          <Tooltip title={isFrozen ? "Unfreeze card" : "Freeze card"}>
            <IconButton
              size="small"
              onClick={handleToggleFreeze}
              color={isFrozen ? "warning" : "default"}
            >
              {isFrozen ? (
                <WbSunnyRounded fontSize="small" />
              ) : (
                <AcUnitRounded fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}

        <Button
          size="small"
          variant="contained"
          startIcon={<PaymentRounded />}
          onClick={() => onSimulate(card)}
          disabled={card.status !== "active"}
        >
          Pay
        </Button>

        <Button
          size="small"
          variant="text"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Less" : "Details"}
        </Button>
      </Box>

      {/* Expanded details */}
      <Collapse in={expanded}>
        <Divider />
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {/* CVV */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              CVV
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", fontWeight: 600 }}
            >
              {revealed ? card.cvv : "•••"}
            </Typography>
          </Box>
          <Divider />
          {/* Spending limit */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={card.spendingLimit !== null}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      setSpendingLimit(card.id, null);
                      setLimitDraft("");
                    } else {
                      setLimitDraft("1000");
                      setSpendingLimit(card.id, 1000);
                    }
                  }}
                />
              }
              label={
                <Typography variant="caption">
                  Monthly spending limit
                </Typography>
              }
            />
            {card.spendingLimit !== null && (
              <Box
                sx={{ display: "flex", gap: 1, mt: 1, alignItems: "center" }}
              >
                <TextField
                  size="small"
                  type="number"
                  value={limitDraft}
                  onChange={(e) => setLimitDraft(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <Typography sx={{ mr: 0.5 }}>$</Typography>
                      ),
                    },
                    htmlInput: { min: 1 },
                  }}
                  sx={{ width: 130 }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleSaveLimit}
                >
                  Save
                </Button>
                <Typography variant="caption" color="text.secondary">
                  / month
                </Typography>
              </Box>
            )}
          </Box>
          <Divider />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">
              Card ID
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
              {card.id.slice(-10)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">
              Issued
            </Typography>
            <Typography variant="caption">
              {new Date(card.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}
