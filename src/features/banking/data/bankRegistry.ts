// ---------------------------------------------------------------------------
// Bank Registry — mock dataset mapping account-number prefixes to banks.
// Internal SmExPay accounts: SMX + 10 digits
// External mock banks: various recognisable prefixes for demo purposes.
// ---------------------------------------------------------------------------

export interface BankInfo {
  /** Short bank code / prefix that identifies this bank */
  code: string;
  name: string;
  shortName: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  /** CSS gradient used as bank colour in UI */
  color: string;
  accentColor: string;
  /** Account-number prefix(es) this bank owns (case-insensitive) */
  prefixes: string[];
  swift: string;
  routingNumber?: string;
}

export const BANK_REGISTRY: BankInfo[] = [
  // ── Internal bank ────────────────────────────────────────────────────────
  {
    code: "SMX",
    name: "SmExPay Bank",
    shortName: "SmExPay",
    country: "United States",
    countryCode: "US",
    color: "#1B4FD8",
    accentColor: "#3B82F6",
    prefixes: ["SMX"],
    swift: "SMXPUS33",
    routingNumber: "021000089",
  },

  // ── Mock US banks ─────────────────────────────────────────────────────────
  {
    code: "APEX",
    name: "Apex National Bank",
    shortName: "Apex Bank",
    country: "United States",
    countryCode: "US",
    color: "#7C3AED",
    accentColor: "#A78BFA",
    prefixes: ["APX", "APEX"],
    swift: "APXNUS33",
    routingNumber: "021200025",
  },
  {
    code: "NOVA",
    name: "Nova Financial Group",
    shortName: "Nova Bank",
    country: "United States",
    countryCode: "US",
    color: "#0F766E",
    accentColor: "#14B8A6",
    prefixes: ["NVA", "NOVA"],
    swift: "NOVAUS44",
    routingNumber: "021300077",
  },
  {
    code: "CREST",
    name: "Crestline Savings Bank",
    shortName: "Crestline",
    country: "United States",
    countryCode: "US",
    color: "#B45309",
    accentColor: "#F59E0B",
    prefixes: ["CRS", "CRST"],
    swift: "CRSTUS55",
    routingNumber: "026009593",
  },
  {
    code: "METRO",
    name: "Metro Trust Bank",
    shortName: "Metro Trust",
    country: "United States",
    countryCode: "US",
    color: "#BE123C",
    accentColor: "#FB7185",
    prefixes: ["MTR", "METR"],
    swift: "MTRUS22",
  },

  // ── Mock UK banks ─────────────────────────────────────────────────────────
  {
    code: "BRIT",
    name: "Britannia Premier Bank",
    shortName: "Britannia",
    country: "United Kingdom",
    countryCode: "GB",
    color: "#1E3A5F",
    accentColor: "#3B82F6",
    prefixes: ["BRT", "BRIT"],
    swift: "BRITGB2L",
  },
  {
    code: "CROWN",
    name: "Crown & Sterling Bank",
    shortName: "Crown Sterling",
    country: "United Kingdom",
    countryCode: "GB",
    color: "#065F46",
    accentColor: "#34D399",
    prefixes: ["CWN", "CRWN"],
    swift: "CWNGB3L",
  },

  // ── Mock EU banks ─────────────────────────────────────────────────────────
  {
    code: "EURO",
    name: "EuroVault Financial",
    shortName: "EuroVault",
    country: "Germany",
    countryCode: "DE",
    color: "#374151",
    accentColor: "#6B7280",
    prefixes: ["EVF", "EURO"],
    swift: "EVFPDE33",
  },
  {
    code: "ATLAS",
    name: "Atlas Merchant Bank",
    shortName: "Atlas Bank",
    country: "France",
    countryCode: "FR",
    color: "#7F1D1D",
    accentColor: "#EF4444",
    prefixes: ["ATL", "ATLS"],
    swift: "ATLSFR21",
  },

  // ── Mock Asian banks ──────────────────────────────────────────────────────
  {
    code: "ORIENT",
    name: "Orient Pacific Bank",
    shortName: "Orient Pacific",
    country: "Singapore",
    countryCode: "SG",
    color: "#1C1917",
    accentColor: "#A16207",
    prefixes: ["OPB", "ORNT"],
    swift: "OPBSSG22",
  },

  // ── Mock African / LatAm banks ────────────────────────────────────────────
  {
    code: "ZENITH",
    name: "Zenith Trust Bank",
    shortName: "Zenith",
    country: "Nigeria",
    countryCode: "NG",
    color: "#14532D",
    accentColor: "#22C55E",
    prefixes: ["ZNT", "ZNTH"],
    swift: "ZNTHNG21",
  },
  {
    code: "SABANA",
    name: "Sabana Continental Bank",
    shortName: "Sabana",
    country: "Brazil",
    countryCode: "BR",
    color: "#78350F",
    accentColor: "#D97706",
    prefixes: ["SBN", "SABA"],
    swift: "SBNABR33",
  },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/**
 * Look up a bank by account number prefix (case-insensitive).
 * Returns null if no bank matches.
 */
export function lookupBankByAccountNumber(
  accountNumber: string,
): BankInfo | null {
  const upper = accountNumber.trim().toUpperCase();
  for (const bank of BANK_REGISTRY) {
    for (const prefix of bank.prefixes) {
      if (upper.startsWith(prefix.toUpperCase())) return bank;
    }
  }
  return null;
}

/**
 * Look up a bank by its SWIFT/BIC code.
 */
export function lookupBankBySwift(swift: string): BankInfo | null {
  const upper = swift.trim().toUpperCase();
  return BANK_REGISTRY.find((b) => b.swift.toUpperCase() === upper) ?? null;
}

/**
 * Determine whether an account number belongs to our internal bank (SmExPay).
 */
export function isInternalAccount(accountNumber: string): boolean {
  return accountNumber.trim().toUpperCase().startsWith("SMX");
}
