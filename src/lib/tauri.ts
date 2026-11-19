import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export type AccountKind = "microsoft" | "offline" | "guest";
export interface Account {
  id: string;
  kind: AccountKind;
  name: string;
  uuid: string;
  skinUrl?: string;
}
export interface Progress {
  stage: string;
  percent: number;
  current: number;
  total: number;
}

// Chạy ngoài Tauri (trình duyệt) thì dùng dữ liệu giả để xem giao diện.
const inTauri = "__TAURI_INTERNALS__" in window;

let mockAccounts: Account[] = [
  { id: "g1", kind: "guest", name: "Player_4821", uuid: "00000000-0000-0000-0000-000000000000" },
];
const mockCbs = new Set<(p: Progress) => void>();

export async function listAccounts(): Promise<Account[]> {
  if (!inTauri) return mockAccounts;
  return invoke<Account[]>("list_accounts");
}

export async function addOfflineAccount(name: string): Promise<Account> {
  if (!inTauri) {
    const a: Account = { id: crypto.randomUUID(), kind: "offline", name, uuid: crypto.randomUUID() };
    mockAccounts = [...mockAccounts, a];
    return a;
  }
  return invoke<Account>("add_offline_account", { name });
}

export async function listVersions(): Promise<string[]> {
  if (!inTauri) return ["1.21.4", "1.21.1", "1.20.4", "1.20.1", "1.19.4", "1.18.2", "1.16.5", "1.12.2", "1.8.9"];
  return invoke<string[]>("list_versions");
}

export async function launchGame(accountId: string, version: string, loader: string, ramMb: number): Promise<void> {
  if (!inTauri) {
    const steps = ["Tải game", "Tải thư viện", "Tải assets", "Chuẩn bị Java", "Game đang chạy"];
    for (let i = 0; i < steps.length; i++) {
      mockCbs.forEach((cb) => cb({ stage: steps[i], percent: 100, current: i + 1, total: steps.length }));
      await new Promise((r) => setTimeout(r, 400));
    }
    return;
  }
  return invoke("launch_game", { accountId, version, loader, ramMb });
}

export function onProgress(cb: (p: Progress) => void): Promise<() => void> {
  if (!inTauri) {
    mockCbs.add(cb);
    return Promise.resolve(() => { mockCbs.delete(cb); });
  }
  return listen<Progress>("launch-progress", (e) => cb(e.payload));
}

export function onGameExit(cb: () => void): Promise<() => void> {
  if (!inTauri) return Promise.resolve(() => {});
  return listen("game-exit", () => cb());
}
