// ---------------------------------------------------------------------------
// Luhn Algorithm (ISO/IEC 7812) — credit/debit card number validation
// ---------------------------------------------------------------------------

export type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "dinersclub"
  | "jcb"
  | "unionpay"
  | "maestro"
  | "unknown";

export interface CardBrandInfo {
  brand: CardBrand;
  label: string;
  /** Expected card number length(s) */
  lengths: number[];
  /** CVV/CVC digit count */
  cvvLength: number;
  /** Regex against raw digits to identify the brand early (prefix detection) */
  pattern: RegExp;
  /** Gradient pair for card UI */
  gradient: [string, string];
}

// Brand definitions — order matters (more-specific first)
export const CARD_BRANDS: CardBrandInfo[] = [
  {
    brand: "amex",
    label: "American Express",
    lengths: [15],
    cvvLength: 4,
    pattern: /^3[47]/,
    gradient: ["#1a1a2e", "#16213e"],
  },
  {
    brand: "dinersclub",
    label: "Diners Club",
    lengths: [14],
    cvvLength: 3,
    pattern: /^3(?:0[0-5]|[68])/,
    gradient: ["#2d3436", "#636e72"],
  },
  {
    brand: "jcb",
    label: "JCB",
    lengths: [16],
    cvvLength: 3,
    pattern: /^(?:2131|1800|35\d{3})/,
    gradient: ["#00b09b", "#096033"],
  },
  {
    brand: "unionpay",
    label: "UnionPay",
    lengths: [16, 17, 18, 19],
    cvvLength: 3,
    pattern: /^62/,
    gradient: ["#c0392b", "#922b21"],
  },
  {
    brand: "maestro",
    label: "Maestro",
    lengths: [12, 13, 14, 15, 16, 17, 18, 19],
    cvvLength: 3,
    pattern: /^(?:5018|5020|5038|6304|6759|6761|6763)/,
    gradient: ["#e44d26", "#f16529"],
  },
  {
    brand: "mastercard",
    label: "Mastercard",
    lengths: [16],
    cvvLength: 3,
    pattern: /^(?:5[1-5]|2(?:2[2-9]|[3-6]\d|7[01]|720))/,
    gradient: ["#eb3349", "#f45c43"],
  },
  {
    brand: "discover",
    label: "Discover",
    lengths: [16, 17, 18, 19],
    cvvLength: 3,
    pattern: /^(?:6011|64[4-9]|65)/,
    gradient: ["#f7971e", "#ffd200"],
  },
  {
    brand: "visa",
    label: "Visa",
    lengths: [13, 16, 19],
    cvvLength: 3,
    pattern: /^4/,
    gradient: ["#1B4FD8", "#1565C0"],
  },
];

const UNKNOWN_BRAND: CardBrandInfo = {
  brand: "unknown",
  label: "Unknown",
  lengths: [16],
  cvvLength: 3,
  pattern: /.*/,
  gradient: ["#374151", "#6B7280"],
};

// ---------------------------------------------------------------------------
// Core Luhn check
// ---------------------------------------------------------------------------

/** Returns true if the card number passes the Luhn check */
export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 12) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

// ---------------------------------------------------------------------------
// Brand detection
// ---------------------------------------------------------------------------

/** Detect the card brand from the raw number string (partial is OK) */
export function detectCardBrand(cardNumber: string): CardBrandInfo {
  const digits = cardNumber.replace(/\D/g, "");
  return CARD_BRANDS.find((b) => b.pattern.test(digits)) ?? UNKNOWN_BRAND;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/**
 * Insert spaces at the correct positions for the detected brand.
 * Amex: 4-6-5,  everything else: 4-4-4-4
 */
export function formatCardNumber(raw: string, brand: CardBrand): string {
  const digits = raw.replace(/\D/g, "");
  if (brand === "amex") {
    return digits.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(" "),
    );
  }
  return digits.replace(
    /^(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,3}).*/,
    (_, a, b, c, d, e) => [a, b, c, d, e].filter(Boolean).join(" "),
  );
}

/** Format expiry as MM/YY, stripping non-digits */
export function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

// ---------------------------------------------------------------------------
// Full card validation
// ---------------------------------------------------------------------------

export interface CardValidationResult {
  /** Whether all fields pass */
  valid: boolean;
  brand: CardBrandInfo;
  luhnValid: boolean;
  errors: {
    cardNumber?: string;
    expiry?: string;
    cvv?: string;
    name?: string;
  };
}

/**
 * Validate a full card: number (Luhn + length), expiry (not expired), CVV length.
 */
export function validateCard(
  cardNumber: string,
  expiry: string, // MM/YY
  cvv: string,
  cardholderName: string,
): CardValidationResult {
  const digits = cardNumber.replace(/\D/g, "");
  const brand = detectCardBrand(digits);
  const errors: CardValidationResult["errors"] = {};

  // ── Card number ──────────────────────────────────────────────────────────
  if (!digits) {
    errors.cardNumber = "Card number is required.";
  } else if (digits.length < 12) {
    errors.cardNumber = "Card number is too short.";
  } else if (!brand.lengths.includes(digits.length)) {
    errors.cardNumber = `${brand.label} cards must have ${brand.lengths.join(" or ")} digits.`;
  } else if (!luhnCheck(digits)) {
    errors.cardNumber = "Card number is invalid (failed security check).";
  }

  // ── Expiry ───────────────────────────────────────────────────────────────
  const expiryClean = expiry.replace(/\D/g, "");
  if (!expiryClean) {
    errors.expiry = "Expiry date is required.";
  } else if (expiryClean.length !== 4) {
    errors.expiry = "Enter expiry as MM/YY.";
  } else {
    const month = parseInt(expiryClean.slice(0, 2), 10);
    const year = parseInt(`20${expiryClean.slice(2)}`, 10);
    if (month < 1 || month > 12) {
      errors.expiry = "Month must be between 01 and 12.";
    } else {
      const now = new Date();
      const expDate = new Date(year, month); // first day of month AFTER expiry
      if (expDate <= now) {
        errors.expiry = "This card has expired.";
      }
    }
  }

  // ── CVV ──────────────────────────────────────────────────────────────────
  const cvvDigits = cvv.replace(/\D/g, "");
  if (!cvvDigits) {
    errors.cvv = "CVV is required.";
  } else if (cvvDigits.length !== brand.cvvLength) {
    errors.cvv = `${brand.label} CVV must be ${brand.cvvLength} digits.`;
  }

  // ── Cardholder name ───────────────────────────────────────────────────────
  if (!cardholderName.trim()) {
    errors.name = "Cardholder name is required.";
  } else if (cardholderName.trim().length < 2) {
    errors.name = "Enter the full name as it appears on the card.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    brand,
    luhnValid: luhnCheck(digits),
    errors,
  };
}
