import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Send, X } from "lucide-react";
import { useStore } from "../../lib/store";

interface Msg { role: "user" | "ai"; text: string }

export default function AIBubble() {
  const { aiOpen, toggleAI } = useStore();
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Xin chào! Mình theo dõi log game và sẽ tự sửa lỗi khi game bị văng." },
  ]);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    setMsgs((m) => [
      ...m,
      { role: "user", text: t },
      { role: "ai", text: "Đã nhận. (Kết nối LLM sẽ được code ở module AI Auto-Fixer.)" },
    ]);
    setInput("");
  };

  return (
    <>
      {/* Nút nổi hào quang kiểu Siri */}
      <motion.button
        onClick={toggleAI}
        whileTap={{ scale: 0.9 }}
        className="fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ bottom: "calc(var(--safe-bottom) + 110px)" }}
        aria-label="Trợ lý AI"
      >
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, #0a84ff, #bf5af2, #ff375f, #ff9f0a, #30d158, #0a84ff)",
            filter: "blur(10px)",
            opacity: 0.8,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <span className="liquid-glass relative flex h-12 w-12 items-center justify-center rounded-full">
          <Sparkles size={22} />
        </span>
      </motion.button>

      <AnimatePresence>
        {aiOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="liquid-glass fixed right-5 z-50 flex h-[420px] w-[min(92vw,360px)] origin-bottom-right flex-col overflow-hidden rounded-[30px]"
            style={{ bottom: "calc(var(--safe-bottom) + 180px)" }}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="flex items-center gap-2 font-medium"><Sparkles size={16} /> Trợ lý AI</span>
              <button onClick={toggleAI}><X size={18} /></button>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-2">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-sky-500 text-white" : "bg-white/15"}`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Hỏi hoặc mô tả lỗi…"
                className="min-w-0 flex-1 rounded-full bg-white/10 px-4 py-2 text-sm outline-none"
              />
              <button onClick={send} className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
