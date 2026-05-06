import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Card, CardTransaction, CardTxCategory } from "@/types/banking";
import { generateDefaultCards } from "@/features/cards/utils/cardGenerator";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface CardState {
  /** Cards keyed by userId → cards array */
  cardsByUser: Record<string, Card[]>;
  /** Transactions keyed by cardId → transactions array */
  txByCard: Record<string, CardTransaction[]>;
}

interface CardActions {
  /** Ensures a user has their two default cards; call once on page load */
  initCards: (
    userId: string,
    accountId: string,
    cardholderName: string,
  ) => void;
  /** Get all cards for a user */
  getCards: (userId: string) => Card[];
  /** Get all transactions for a card */
  getCardTransactions: (cardId: string) => CardTransaction[];
  /** Get all transactions for a user (across all cards) */
  getAllTransactions: (userId: string) => CardTransaction[];
  /** Freeze / unfreeze a card */
  setCardStatus: (cardId: string, status: Card["status"]) => void;
  /** Update card nickname */
  renameCard: (cardId: string, nickname: string) => void;
  /** Update spending limit */
  setSpendingLimit: (cardId: string, limit: number | null) => void;
  /**
   * Simulate a card purchase.
   * Returns { approved: true } or { approved: false, reason: string }.
   */
  simulatePurchase: (params: {
    card: Card;
    merchant: string;
    category: CardTxCategory;
    amount: number;
    accountBalance: number;
  }) => { approved: boolean; reason?: string };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCardStore = create<CardState & CardActions>()(
  persist(
    (set, get) => ({
      cardsByUser: {},
      txByCard: {},

      // ── initCards ─────────────────────────────────────────────────────────
      initCards(userId, accountId, cardholderName) {
        const existing = get().cardsByUser[userId];
        if (existing && existing.length > 0) return; // already initialised
        const cards = generateDefaultCards(userId, accountId, cardholderName);
        set((s) => ({
          cardsByUser: { ...s.cardsByUser, [userId]: cards },
        }));
      },

      // ── getCards ──────────────────────────────────────────────────────────
      getCards(userId) {
        return get().cardsByUser[userId] ?? [];
      },

      // ── getCardTransactions ───────────────────────────────────────────────
      getCardTransactions(cardId) {
        return (get().txByCard[cardId] ?? []).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      },

      // ── getAllTransactions ────────────────────────────────────────────────
      getAllTransactions(userId) {
        const cards = get().getCards(userId);
        return cards
          .flatMap((c) => get().getCardTransactions(c.id))
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
      },

      // ── setCardStatus ─────────────────────────────────────────────────────
      setCardStatus(cardId, status) {
        set((s) => {
          const updated: Record<string, Card[]> = {};
          for (const [uid, cards] of Object.entries(s.cardsByUser)) {
            updated[uid] = cards.map((c) =>
              c.id === cardId ? { ...c, status } : c,
            );
          }
          return { cardsByUser: updated };
        });
      },

      // ── renameCard ────────────────────────────────────────────────────────
      renameCard(cardId, nickname) {
        set((s) => {
          const updated: Record<string, Card[]> = {};
          for (const [uid, cards] of Object.entries(s.cardsByUser)) {
            updated[uid] = cards.map((c) =>
              c.id === cardId ? { ...c, nickname } : c,
            );
          }
          return { cardsByUser: updated };
        });
      },

      // ── setSpendingLimit ──────────────────────────────────────────────────
      setSpendingLimit(cardId, limit) {
        set((s) => {
          const updated: Record<string, Card[]> = {};
          for (const [uid, cards] of Object.entries(s.cardsByUser)) {
            updated[uid] = cards.map((c) =>
              c.id === cardId ? { ...c, spendingLimit: limit } : c,
            );
          }
          return { cardsByUser: updated };
        });
      },

      // ── simulatePurchase ──────────────────────────────────────────────────
      simulatePurchase({ card, merchant, category, amount, accountBalance }) {
        // Validation rules
        if (card.status === "frozen") {
          const tx = buildTx(
            card,
            merchant,
            category,
            amount,
            "declined",
            "Card is frozen.",
          );
          appendTx(set, tx);
          return { approved: false, reason: "Card is frozen." };
        }
        if (card.status === "blocked") {
          const tx = buildTx(
            card,
            merchant,
            category,
            amount,
            "declined",
            "Card is blocked.",
          );
          appendTx(set, tx);
          return { approved: false, reason: "Card is blocked." };
        }
        if (amount > accountBalance) {
          const tx = buildTx(
            card,
            merchant,
            category,
            amount,
            "declined",
            "Insufficient funds.",
          );
          appendTx(set, tx);
          return {
            approved: false,
            reason: "Insufficient funds in linked account.",
          };
        }
        if (card.spendingLimit !== null) {
          // Check current month's spending on this card
          const thisMonth = new Date();
          const monthSpent = (get().txByCard[card.id] ?? [])
            .filter((t) => {
              const d = new Date(t.createdAt);
              return (
                t.status === "approved" &&
                d.getMonth() === thisMonth.getMonth() &&
                d.getFullYear() === thisMonth.getFullYear()
              );
            })
            .reduce((sum, t) => sum + t.amount, 0);

          if (monthSpent + amount > card.spendingLimit) {
            const tx = buildTx(
              card,
              merchant,
              category,
              amount,
              "declined",
              "Monthly spending limit reached.",
            );
            appendTx(set, tx);
            return {
              approved: false,
              reason: `Monthly spending limit of $${card.spendingLimit.toLocaleString()} reached.`,
            };
          }
        }

        const tx = buildTx(card, merchant, category, amount, "approved");
        appendTx(set, tx);
        return { approved: true };
      },
    }),
    {
      name: "smexpay-cards",
      // Only persist the data, not the action functions
      partialize: (s) => ({ cardsByUser: s.cardsByUser, txByCard: s.txByCard }),
    },
  ),
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildTx(
  card: Card,
  merchant: string,
  category: CardTxCategory,
  amount: number,
  status: CardTransaction["status"],
  declineReason?: string,
): CardTransaction {
  return {
    id: `ctx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cardId: card.id,
    accountId: card.accountId,
    merchant,
    category,
    amount,
    currency: "USD",
    status,
    declineReason,
    createdAt: new Date().toISOString(),
  };
}

function appendTx(
  set: (fn: (s: CardState) => Partial<CardState>) => void,
  tx: CardTransaction,
) {
  set((s) => ({
    txByCard: {
      ...s.txByCard,
      [tx.cardId]: [tx, ...(s.txByCard[tx.cardId] ?? [])],
    },
  }));
}
