import { supabase } from "@/lib/supabase";
import type { Transaction } from "@/types/banking";

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

/**
 * Transfer funds between two accounts via a Supabase RPC function.
 * The RPC handles atomicity and balance checks server-side.
 */
export async function transferFunds(params: {
  fromAccountId: string;
  toAccountNumber: string;
  amount: number;
  description?: string;
}): Promise<void> {
  const { error } = await supabase.rpc("transfer_funds", {
    p_from_account_id: params.fromAccountId,
    p_to_account_number: params.toAccountNumber,
    p_amount: params.amount,
    p_description: params.description ?? "Transfer",
  });

  if (error) throw error;
}
