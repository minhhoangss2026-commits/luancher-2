import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import GlassCard from "../../components/GlassCard";
import { useStore } from "../../lib/store";
import { launchGame, listVersions, onGameExit, onProgress } from "../../lib/tauri";

const LOADERS = ["Vanilla", "Fabric", "Forge", "NeoForge", "Quilt"] as const;
type Loader = (typeof LOADERS)[number];
const FALLBACK_VERSIONS = ["1.21.4", "1.21.1", "1.20.4", "1.20.1", "1.19.4", "1.18.2", "1.16.5", "1.12.2", "1.8.9"];

export default function PlayPanel() {
  const { activeId } = useStore();
  const [loader, setLoader] = useState<Loader>("Vanilla");
  const [versions, setVersions] = useState<string[]>(FALLBACK_VERSIONS);
  const [version, setVersion] = useState("1.21.1");
  const [ram, setRam] = useState(4096);
  const [busy, setBusy] = useState(false);     // đang tải
  const [running, setRunning] = useState(false); // game đang chạy
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  // Lấy danh sách phiên bản thật từ Mojang
  useEffect(() => {
    listVersions()
      .then((v) => { if (v.length) { setVersions(v); setVersion((cur) => (v.includes(cur) ? cur : v[0])); } })
      .catch(() => {});
  }, []);

  // Nhận tiến trình + sự kiện game thoát từ Rust
  useEffect(() => {
    let offP: (() => void) | undefined;
    let offE: (() => void) | undefined;
    onProgress((p) => {
      setStatus(p.total > 1 && p.stage.startsWith("Tải") ? `${p.stage} ${p.current}/${p.total}` : p.stage);
      setProgress(p.percent);
    }).then((f) => (offP = f));
    onGameExit(() => { setRunning(false); setStatus(""); setProgress(0); }).then((f) => (offE = f));
    return () => { offP?.(); offE?.(); };
  }, []);

  const play = async () => {
    if (!activeId || busy || running) return;
    setError("");
    setBusy(true);
    setProgress(0);
    setStatus("Bắt đầu…");
    try {
      await launchGame(activeId, version, loader, ram);
      setRunning(true);
    } catch (e) {
      setError(String(e));
      setStatus("");
      setProgress(0);
    } finally {
      setBusy(false);
    }
  };

  const label = running ? "ĐANG CHẠY…" : busy ? status : "PLAY";

  return (
    <GlassCard
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 160, damping: 20 }}
      className="mx-auto w-full max-w-2xl p-6"
    >
      <h2 className="text-2xl font-semibold tracking-tight">Sẵn sàng chơi</h2>

      <div className="mt-5 flex flex-wrap gap-2">
        {LOADERS.map((l) => {
          const supported = l === "Vanilla";
          return (
            <button
              key={l}
              disabled={!supported}
              onClick={() => setLoader(l)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                loader === l ? "bg-sky-500 text-white" : "bg-white/10 hover:bg-white/20"
              } ${supported ? "" : "cursor-not-allowed opacity-40"}`}
            >
              {l}{supported ? "" : " · sắp có"}
            </button>
          );
        })}
      </div>

      <label className="mt-5 block text-xs" style={{ color: "var(--text-dim)" }}>Phiên bản Minecraft</label>
      <select
        value={version}
        onChange={(e) => setVersion(e.target.value)}
        className="mt-1 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm outline-none"
      >
        {versions.map((v) => <option key={v} value={v} className="text-black">{v}</option>)}
      </select>

      <div className="mt-5">
        <div className="flex justify-between text-xs" style={{ color: "var(--text-dim)" }}>
          <span>RAM cấp phát</span><span>{(ram / 1024).toFixed(1)} GB</span>
        </div>
        <input
          type="range" min={1024} max={16384} step={512} value={ram}
          onChange={(e) => setRam(+e.target.value)}
          className="mt-2 w-full accent-sky-500"
        />
      </div>

      <motion.button
        onClick={play}
        disabled={busy || running}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        className="relative mt-7 flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-[26px] bg-gradient-to-r from-sky-500 to-indigo-500 text-xl font-semibold text-white shadow-lg disabled:opacity-90"
      >
        {busy && (
          <motion.div
            className="absolute inset-y-0 left-0 bg-white/25"
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          {!busy && !running && <Play fill="white" size={22} />} {label}
        </span>
      </motion.button>

      {error && (
        <div className="mt-3 break-words rounded-2xl bg-red-500/20 px-4 py-3 text-sm text-red-300">{error}</div>
      )}
    </GlassCard>
  );
}
