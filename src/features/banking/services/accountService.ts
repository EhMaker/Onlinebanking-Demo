import { supabase } from "@/lib/supabase";
import type { Account } from "@/types/banking";

/** Fetch the authenticated user's account. Returns null if not yet created. */
export async function fetchUserAccount(
  userId: string,
): Promise<Account | null> {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // no row yet
    throw error;
  }

  return data as Account;
}

/** Fetch an account by its account number (for transfer target lookup). */
export async function fetchAccountByNumber(
  accountNumber: string,
): Promise<Account | null> {
  const { data, error } = await supabase
    .from("accounts")
    .select("id, account_number, account_type, currency, user_id")
    .eq("account_number", accountNumber)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as Account;
}
