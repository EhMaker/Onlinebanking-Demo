// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------

export type AccountType = "checking" | "savings";

export interface Account {
  id: string;
  user_id: string;
  account_number: string;
  account_type: AccountType;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Transaction
// ---------------------------------------------------------------------------

export type TransactionType = "transfer" | "deposit" | "withdrawal";
export type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;
  from_account_id: string | null;
  to_account_id: string | null;
  amount: number;
  description: string | null;
  type: TransactionType;
  status: TransactionStatus;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns whether a transaction is a debit (money leaving) for the given account */
export function isDebit(tx: Transaction, accountId: string): boolean {
  return tx.from_account_id === accountId;
}

/** Signed amount: negative for debits, positive for credits */
export function signedAmount(tx: Transaction, accountId: string): number {
  return isDebit(tx, accountId) ? -tx.amount : tx.amount;
}

export interface TransferParams {
  fromAccountId: string;
  toAccountNumber: string;
  amount: number;
  description?: string;
}
