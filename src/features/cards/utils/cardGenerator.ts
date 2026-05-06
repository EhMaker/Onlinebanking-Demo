import type { Card, CardNetwork } from "@/types/banking";

// ---------------------------------------------------------------------------
// Luhn check-digit calculation
// ---------------------------------------------------------------------------

function luhnCheckDigit(partial: string): string {
  const digits = partial.split("").map(Number);
  let sum = 0;
  // For the check digit position we treat it as even (0-indexed from right = 0)
  // so the rightmost existing digit is odd position
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i];
    if ((digits.length - i) % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return String((10 - (sum % 10)) % 10);
}

// ---------------------------------------------------------------------------
// Deterministic pseudo-random number generator (xorshift32)
// Seeded from userId + index so the same user always gets the same cards.
// ---------------------------------------------------------------------------

function seedFrom(userId: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < userId.length; i++) {
    h = Math.imul(h ^ userId.charCodeAt(i), 0x9e3779b9);
    h ^= h >>> 16;
  }
  return h >>> 0;
}

function xorshift32(seed: number): () => number {
  let state = seed === 0 ? 1 : seed;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0xffffffff;
  };
}

function randDigits(rng: () => number, count: number): string {
  return Array.from({ length: count }, () => Math.floor(rng() * 10)).join("");
}

// ---------------------------------------------------------------------------
// Card number generation
// ---------------------------------------------------------------------------

function generateCardNumber(network: CardNetwork, rng: () => number): string {
  let prefix: string;
  if (network === "visa") {
    prefix = "4";
    const partial = prefix + randDigits(rng, 14);
    return partial + luhnCheckDigit(partial);
  } else {
    // Mastercard: 51-55
    const mcPrefixes = ["51", "52", "53", "54", "55"];
    prefix = mcPrefixes[Math.floor(rng() * mcPrefixes.length)];
    const partial = prefix + randDigits(rng, 13);
    return partial + luhnCheckDigit(partial);
  }
}

// ---------------------------------------------------------------------------
// Expiry generation (1–5 years from now)
// ---------------------------------------------------------------------------

function generateExpiry(rng: () => number, offsetYears: number): string {
  const base = new Date();
  const year = base.getFullYear() + offsetYears;
  const month = Math.floor(rng() * 12) + 1;
  return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
}

// ---------------------------------------------------------------------------
// CVV
// ---------------------------------------------------------------------------

function generateCvv(rng: () => number): string {
  return randDigits(rng, 3);
}

// ---------------------------------------------------------------------------
// Public: generate the two default cards for a user
// ---------------------------------------------------------------------------

const CARD_NICKNAMES = [
  "Primary Debit",
  "Secondary Debit",
  "Shopping Card",
  "Travel Card",
];

export function generateDefaultCards(
  userId: string,
  accountId: string,
  cardholderName: string,
): Card[] {
  const cards: Card[] = [];

  const networks: CardNetwork[] = ["visa", "mastercard"];
  const offsets = [3, 5]; // expiry years ahead for card 1 and 2

  for (let i = 0; i < 2; i++) {
    const seed = seedFrom(userId, i + 1);
    const rng = xorshift32(seed);
    const network = networks[i];

    const number = generateCardNumber(network, rng);
    const expiry = generateExpiry(rng, offsets[i]);
    const cvv = generateCvv(rng);

    cards.push({
      id: `card-${userId}-${i}`,
      userId,
      accountId,
      cardholderName,
      number,
      expiry,
      cvv,
      network,
      status: "active",
      nickname: CARD_NICKNAMES[i],
      spendingLimit: null,
      createdAt: new Date(Date.now() - i * 86400000 * 30).toISOString(),
    });
  }

  return cards;
}

// ---------------------------------------------------------------------------
// Mask card number for display: •••• •••• •••• 4321
// ---------------------------------------------------------------------------

export function maskCardNumber(number: string): string {
  const clean = number.replace(/\D/g, "");
  const last4 = clean.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

/** Format full number with spaces: 4111 1111 1111 1111 */
export function formatFullCardNumber(number: string): string {
  return number.replace(/(\d{4})(?=\d)/g, "$1 ");
}
