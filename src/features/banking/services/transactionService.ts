import { supabase } from "@/lib/supabase";
import type { Transaction } from "@/types/banking";

// ---------------------------------------------------------------------------
// Account-number format validation (client-side, instant feedback)
// ---------------------------------------------------------------------------

/** Valid formats: SMX followed by 10 digits  e.g. SMX0012345678 */
const ACCOUNT_NUMBER_RE = /^SMX\d{10}$/i;

export function validateAccountNumberFormat(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Account number is required.";
  if (!ACCOUNT_NUMBER_RE.test(trimmed))
    return "Account number must be in the format SMX followed by 10 digits (e.g. SMX0012345678).";
  return null; // valid
}

// ---------------------------------------------------------------------------
// Simulated processing delay (mimics real banking latency)
// ---------------------------------------------------------------------------

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/** Fetch recent transactions for a given account (both sent and received). */
export async function fetchRecentTransactions(
  accountId: string,
  limit = 10,
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .or(`from_account_id.eq.${accountId},to_account_id.eq.${accountId}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Transaction[];
}

/** Fetch monthly totals for income and expenses from the current month. */
export async function fetchMonthlySummary(
  accountId: string,
): Promise<{ income: number; expenses: number }> {
  const now = new Date();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();

  const { data, error } = await supabase
    .from("transactions")
    .select("amount, from_account_id, to_account_id")
    .or(`from_account_id.eq.${accountId},to_account_id.eq.${accountId}`)
    .gte("created_at", startOfMonth)
    .eq("status", "completed");

  if (error) throw error;

  let income = 0;
  let expenses = 0;

  for (const tx of data ?? []) {
    if (tx.to_account_id === accountId) income += Number(tx.amount);
    if (tx.from_account_id === accountId) expenses += Number(tx.amount);
  }

  return { income, expenses };
}

// ---------------------------------------------------------------------------
// Transfer funds with processing simulation
// ---------------------------------------------------------------------------

export type TransferResult =
  | { success: true }
  | { success: false; message: string };

/**
 * Transfer funds between two accounts.
 *
 * Flow:
 *  1. Validate account-number format immediately (throws on bad format).
 *  2. Simulate a 1.5 s processing delay so the UI can show a "pending" state.
 *  3. Call the Supabase `transfer_funds` RPC (atomic, server-side balance check).
 *  4. Return a typed result so callers can distinguish user-visible failures
 *     (e.g. "Insufficient funds") from unexpected errors.
 *
 * The RPC handles atomicity and balance enforcement — it never leaves the DB
 * in a partially-transferred state.
 */
export async function transferFunds(params: {
  fromAccountId: string;
  toAccountNumber: string;
  amount: number;
  description?: string;
}): Promise<TransferResult> {
  // 1. Format validation (client-side — instant, no network round-trip)
  const formatError = validateAccountNumberFormat(params.toAccountNumber);
  if (formatError) return { success: false, message: formatError };

  // 2. Simulate bank-processing latency (allows "Processing…" spinner in UI)
  await delay(1500);

  // 3. Execute transfer via RPC
  const { error } = await supabase.rpc("transfer_funds", {
    p_from_account_id: params.fromAccountId,
    p_to_account_number: params.toAccountNumber.toUpperCase(),
    p_amount: params.amount,
    p_description: params.description ?? "Transfer",
  });

  if (error) {
    // Translate Postgres / RPC error messages into readable user strings
    const msg = error.message ?? "";
    if (msg.includes("Insufficient funds"))
      return { success: false, message: "Insufficient funds in your account." };
    if (msg.includes("not found") || msg.includes("No account"))
      return { success: false, message: "Recipient account not found." };
    if (msg.includes("same account"))
      return {
        success: false,
        message: "You cannot transfer money to your own account.",
      };
    // Generic fallback
    return {
      success: false,
      message: "Transfer failed. Please try again later.",
    };
  }

  return { success: true };
}
