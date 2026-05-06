// ---------------------------------------------------------------------------
// IBAN (ISO 13616) Validation
//
// Algorithm:
//  1. Strip spaces, uppercase
//  2. Check country code is known and length matches country spec
//  3. Move first 4 chars to end
//  4. Replace each letter with its numeric value (A=10, B=11 … Z=35)
//  5. Compute mod-97 — must equal 1
// ---------------------------------------------------------------------------

export interface IBANResult {
  valid: boolean;
  /** Human-readable error when invalid */
  error?: string;
  /** ISO 3166-1 alpha-2 country code */
  countryCode?: string;
  countryName?: string;
  /** Basic Bank Account Number (the part after the 4-char IBAN header) */
  bban?: string;
  /** Formatted with spaces every 4 chars */
  formatted?: string;
}

// Country code → expected total IBAN length
// Reference: https://www.iban.com/structure
const IBAN_LENGTHS: Record<string, [number, string]> = {
  AL: [28, "Albania"],
  AD: [24, "Andorra"],
  AT: [20, "Austria"],
  AZ: [28, "Azerbaijan"],
  BH: [22, "Bahrain"],
  BY: [28, "Belarus"],
  BE: [16, "Belgium"],
  BA: [20, "Bosnia and Herzegovina"],
  BR: [29, "Brazil"],
  BG: [22, "Bulgaria"],
  CR: [22, "Costa Rica"],
  HR: [21, "Croatia"],
  CY: [28, "Cyprus"],
  CZ: [24, "Czech Republic"],
  DK: [18, "Denmark"],
  DO: [28, "Dominican Republic"],
  EG: [29, "Egypt"],
  SV: [28, "El Salvador"],
  EE: [20, "Estonia"],
  FO: [18, "Faroe Islands"],
  FI: [18, "Finland"],
  FR: [27, "France"],
  GE: [22, "Georgia"],
  DE: [22, "Germany"],
  GI: [23, "Gibraltar"],
  GR: [27, "Greece"],
  GL: [18, "Greenland"],
  GT: [28, "Guatemala"],
  HU: [28, "Hungary"],
  IS: [26, "Iceland"],
  IQ: [23, "Iraq"],
  IE: [22, "Ireland"],
  IL: [23, "Israel"],
  IT: [27, "Italy"],
  JO: [30, "Jordan"],
  KZ: [20, "Kazakhstan"],
  XK: [20, "Kosovo"],
  KW: [30, "Kuwait"],
  LV: [21, "Latvia"],
  LB: [28, "Lebanon"],
  LI: [21, "Liechtenstein"],
  LT: [20, "Lithuania"],
  LU: [20, "Luxembourg"],
  MT: [31, "Malta"],
  MR: [27, "Mauritania"],
  MU: [30, "Mauritius"],
  MD: [24, "Moldova"],
  MC: [27, "Monaco"],
  ME: [22, "Montenegro"],
  NL: [18, "Netherlands"],
  MK: [19, "North Macedonia"],
  NO: [15, "Norway"],
  PK: [24, "Pakistan"],
  PS: [29, "Palestine"],
  PL: [28, "Poland"],
  PT: [25, "Portugal"],
  QA: [29, "Qatar"],
  RO: [24, "Romania"],
  LC: [32, "Saint Lucia"],
  SM: [27, "San Marino"],
  ST: [25, "São Tomé and Príncipe"],
  SA: [24, "Saudi Arabia"],
  RS: [22, "Serbia"],
  SC: [31, "Seychelles"],
  SK: [24, "Slovakia"],
  SI: [19, "Slovenia"],
  ES: [24, "Spain"],
  SD: [18, "Sudan"],
  SE: [24, "Sweden"],
  CH: [21, "Switzerland"],
  TL: [23, "Timor-Leste"],
  TN: [24, "Tunisia"],
  TR: [26, "Turkey"],
  UA: [29, "Ukraine"],
  AE: [23, "United Arab Emirates"],
  GB: [22, "United Kingdom"],
  VA: [22, "Vatican City"],
  VG: [24, "British Virgin Islands"],
};

/** Strip spaces and convert to uppercase */
function normalise(iban: string): string {
  return iban.replace(/\s+/g, "").toUpperCase();
}

/** Format IBAN with a space every 4 characters */
export function formatIBAN(iban: string): string {
  return normalise(iban)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

/** Replace each letter with its two-digit numeric value (A=10 … Z=35) */
function lettersToDigits(str: string): string {
  return str
    .split("")
    .map((ch) => {
      const code = ch.charCodeAt(0);
      return code >= 65 && code <= 90 ? String(code - 55) : ch;
    })
    .join("");
}

/** Compute bigint modulo 97 on a numeric string (avoids JS precision limits) */
function mod97(numStr: string): number {
  let remainder = 0;
  for (const ch of numStr) {
    remainder = (remainder * 10 + parseInt(ch, 10)) % 97;
  }
  return remainder;
}

/**
 * Validate an IBAN string.
 * Accepts spaces (they are stripped before validation).
 */
export function validateIBAN(raw: string): IBANResult {
  if (!raw || !raw.trim()) {
    return { valid: false, error: "IBAN is required." };
  }

  const iban = normalise(raw);

  // Must be alphanumeric
  if (!/^[A-Z0-9]+$/.test(iban)) {
    return {
      valid: false,
      error: "IBAN must contain only letters and digits.",
    };
  }

  // Minimum length sanity check
  if (iban.length < 4) {
    return { valid: false, error: "IBAN is too short." };
  }

  const countryCode = iban.slice(0, 2);
  const entry = IBAN_LENGTHS[countryCode];

  if (!entry) {
    return {
      valid: false,
      error: `Country code "${countryCode}" is not a recognised IBAN country.`,
    };
  }

  const [expectedLength, countryName] = entry;

  if (iban.length !== expectedLength) {
    return {
      valid: false,
      error: `IBANs for ${countryName} must be exactly ${expectedLength} characters (got ${iban.length}).`,
      countryCode,
      countryName,
    };
  }

  // Rearrange: move first 4 chars to end
  const rearranged = iban.slice(4) + iban.slice(0, 4);

  // Convert letters to digits
  const numericStr = lettersToDigits(rearranged);

  // Mod-97 check
  if (mod97(numericStr) !== 1) {
    return {
      valid: false,
      error: "IBAN checksum is invalid. Please double-check the number.",
      countryCode,
      countryName,
    };
  }

  return {
    valid: true,
    countryCode,
    countryName,
    bban: iban.slice(4),
    formatted: formatIBAN(iban),
  };
}
