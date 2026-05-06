import { Box, Typography } from "@mui/material";
import { WifiRounded, CreditCardRounded } from "@mui/icons-material";
import type { CardBrandInfo } from "@/features/banking/utils/luhn";

interface CardPreviewProps {
  cardNumber: string; // already formatted with spaces
  cardholderName: string;
  expiry: string; // MM/YY
  brand: CardBrandInfo;
  flipped?: boolean; // show CVV side
  cvv?: string;
}

export function CardPreview({
  cardNumber,
  cardholderName,
  expiry,
  brand,
  flipped = false,
  cvv = "",
}: CardPreviewProps) {
  const [fromColor, toColor] = brand.gradient;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 380,
        aspectRatio: "1.586 / 1",
        borderRadius: 3,
        background: `linear-gradient(135deg, ${fromColor}, ${toColor})`,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        userSelect: "none",
        transition: "transform 0.4s ease",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.07)",
          top: -80,
          right: -60,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          bottom: -60,
          left: -40,
          pointerEvents: "none",
        }}
      />

      {!flipped ? (
        /* ── Front face ──────────────────────────────────────────── */
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            p: "5%",
          }}
        >
          {/* Top row: brand label + contactless icon */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.85rem",
                fontWeight: 700,
                opacity: 0.9,
                letterSpacing: 1,
              }}
            >
              {brand.label}
            </Typography>
            <WifiRounded
              sx={{ fontSize: 22, transform: "rotate(90deg)", opacity: 0.8 }}
            />
          </Box>

          {/* Chip */}
          <Box
            sx={{
              width: 44,
              height: 34,
              borderRadius: "6px",
              background: "linear-gradient(135deg, #e8c96d, #c8a84b)",
              boxShadow: "inset 0 0 6px rgba(0,0,0,0.2)",
            }}
          />

          {/* Card number */}
          <Typography
            sx={{
              fontFamily: "'Courier New', monospace",
              fontSize: "clamp(0.9rem, 3.5vw, 1.2rem)",
              letterSpacing: "0.15em",
              fontWeight: 600,
            }}
          >
            {cardNumber || "•••• •••• •••• ••••"}
          </Typography>

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
                  mb: 0.25,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Card Holder
              </Typography>
              <Typography
                sx={{ fontWeight: 600, fontSize: "0.85rem", letterSpacing: 1 }}
              >
                {cardholderName.trim().toUpperCase() || "FULL NAME"}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  opacity: 0.7,
                  mb: 0.25,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Expires
              </Typography>
              <Typography
                sx={{ fontWeight: 600, fontSize: "0.85rem", letterSpacing: 1 }}
              >
                {expiry || "MM/YY"}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        /* ── Back face ───────────────────────────────────────────── */
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            transform: "rotateY(180deg)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Magnetic stripe */}
          <Box sx={{ width: "100%", height: 44, bgcolor: "#111", mb: 3 }} />

          {/* Signature + CVV strip */}
          <Box sx={{ px: "5%", display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                flex: 1,
                height: 36,
                background:
                  "repeating-linear-gradient(45deg, #fff 0px, #fff 5px, #eee 5px, #eee 10px)",
                borderRadius: 1,
              }}
            />
            <Box
              sx={{
                minWidth: 52,
                height: 36,
                bgcolor: "#fff",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  color: "#111",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  letterSpacing: 3,
                }}
              >
                {cvv || "•••"}
              </Typography>
            </Box>
          </Box>

          {/* Bottom label */}
          <Box
            sx={{
              px: "5%",
              mt: 3,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              opacity: 0.7,
            }}
          >
            <CreditCardRounded sx={{ fontSize: 14 }} />
            <Typography sx={{ fontSize: "0.65rem" }}>
              {brand.label} · {brand.cvvLength}-digit CVV
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
