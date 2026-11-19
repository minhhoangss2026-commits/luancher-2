import { useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "../../lib/store";
import { listAccounts } from "../../lib/tauri";
import AccountSwitcher from "./AccountSwitcher";
import DynamicDock from "./DynamicDock";
import PlayPanel from "./PlayPanel";
import AIBubble from "../ai/AIBubble";
import GlassCard from "../../components/GlassCard";

const titles: Record<string, string> = {
  boost: "Tối ưu hóa & FPS Boost",
  mods: "Kho Mod (Modrinth · CurseForge)",
  wardrobe: "Kho Skin, Trang phục & Áo choàng",
  ai: "Trợ lý AI · Chẩn đoán & Tự sửa lỗi",
  settings: "Cài đặt",
};

export default function Dashboard() {
  const { tab, setAccounts } = useStore();

  // Rust tự tạo hồ sơ Khách (Player_XXXX) ở lần mở đầu tiên
  useEffect(() => { listAccounts().then(setAccounts); }, [setAccounts]);

  return (
    <motion.div
      className="relative h-full w-full"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 90, damping: 18 }}
    >
      <header className="flex items-center justify-between px-5" style={{ paddingTop: "calc(var(--safe-top) + 16px)" }}>
        <AccountSwitcher />
        <div className="liquid-glass rounded-full px-4 py-2 text-xs">Cosmic Launcher</div>
      </header>

      <main className="flex h-[calc(100%-140px)] items-center justify-center overflow-y-auto px-5">
        {tab === "play" ? (
          <PlayPanel />
        ) : (
          <GlassCard
            className="w-full max-w-2xl p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-semibold">{titles[tab]}</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-dim)" }}>
              Module này sẽ được viết đầy đủ ở các bước tiếp theo.
            </p>
          </GlassCard>
        )}
      </main>

      <DynamicDock />
      <AIBubble />
    </motion.div>
  );
}
