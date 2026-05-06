import { useMemo, useEffect } from "react";
import { useAccount } from "@/features/banking/hooks/useAccount";
import { useTransactions } from "@/features/banking/hooks/useTransactions";
import { useNotificationStore } from "@/stores/notificationStore";
import type { Transaction } from "@/types/banking";

export type NotificationType = "credit" | "debit" | "pending" | "failed";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

function formatAmount(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

function buildNotification(
  tx: Transaction,
  accountId: string,
  readIds: string[],
): AppNotification {
  const amt = formatAmount(tx.amount);
  const isIncoming = tx.to_account_id === accountId;
  const isPending = tx.status === "pending";
  const isFailed = tx.status === "failed";

  let type: NotificationType;
  let title: string;
  let message: string;

  if (isFailed) {
    type = "failed";
    title = "Transaction failed";
    message = `A transaction of ${amt} could not be processed.`;
  } else if (isPending) {
    type = "pending";
    title = "Transaction pending";
    message = `${amt} is being processed.`;
  } else if (isIncoming) {
    type = "credit";
    title = "Money received";
    message = `${amt} was deposited into your account.`;
  } else {
    type = "debit";
    title = "Transfer sent";
    message = `${amt} was sent from your account.`;
  }

  return {
    id: tx.id,
    type,
    title,
    message,
    timestamp: tx.created_at,
    read: readIds.includes(tx.id),
  };
}

export function useNotifications() {
  const { data: account } = useAccount();
  const { data: transactions, isLoading } = useTransactions(account?.id, 20);
  const { readIds, markRead, markAllRead, clearOld } = useNotificationStore();

  const notifications = useMemo<AppNotification[]>(() => {
    if (!account?.id || !transactions) return [];
    return transactions.map((tx) => buildNotification(tx, account.id, readIds));
  }, [account?.id, transactions, readIds]);

  // Prune stale read IDs on mount / when transaction list changes
  useEffect(() => {
    if (transactions) {
      clearOld(transactions.map((t) => t.id));
    }
  }, [transactions, clearOld]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAllAsRead() {
    markAllRead(notifications.map((n) => n.id));
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markAllAsRead,
  };
}
