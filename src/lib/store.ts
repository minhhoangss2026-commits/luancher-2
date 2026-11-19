import { create } from "zustand";
import type { Account } from "./tauri";

export type Tab = "play" | "boost" | "mods" | "wardrobe" | "ai" | "settings";

interface State {
  accounts: Account[];
  activeId: string | null;
  tab: Tab;
  aiOpen: boolean;
  setAccounts: (a: Account[]) => void;
  setActive: (id: string) => void;
  setTab: (t: Tab) => void;
  toggleAI: () => void;
}

export const useStore = create<State>((set) => ({
  accounts: [],
  activeId: null,
  tab: "play",
  aiOpen: false,
  setAccounts: (accounts) =>
    set((s) => ({ accounts, activeId: s.activeId ?? accounts[0]?.id ?? null })),
  setActive: (activeId) => set({ activeId }),
  setTab: (tab) => set({ tab }),
  toggleAI: () => set((s) => ({ aiOpen: !s.aiOpen })),
}));
