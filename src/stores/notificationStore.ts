import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationStore {
  readIds: string[];
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
  clearOld: (keepIds: string[]) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      readIds: [],

      markRead: (id) =>
        set((s) => ({
          readIds: s.readIds.includes(id) ? s.readIds : [...s.readIds, id],
        })),

      markAllRead: (ids) =>
        set((s) => ({ readIds: [...new Set([...s.readIds, ...ids])] })),

      // Prune IDs that no longer correspond to any transaction (housekeeping)
      clearOld: (keepIds) =>
        set((s) => ({
          readIds: s.readIds.filter((id) => keepIds.includes(id)),
        })),
    }),
    { name: "smexpay-notifications" },
  ),
);
