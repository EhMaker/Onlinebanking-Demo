import { create } from "zustand";
import { persist } from "zustand/middleware";

type ColorMode = "light" | "dark";

interface ThemeState {
  mode: ColorMode;
  toggleMode: () => void;
  setMode: (mode: ColorMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "light",
      toggleMode: () =>
        set({ mode: get().mode === "light" ? "dark" : "light" }),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "smexpay-theme",
      partialize: (s) => ({ mode: s.mode }),
    },
  ),
);
