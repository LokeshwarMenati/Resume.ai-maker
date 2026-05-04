import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { apiJson } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

function streamText(full, onChunk) {
  return new Promise((resolve) => {
    let i = 0;
    const step = 2;
    function tick() {
      i = Math.min(full.length, i + step);
      onChunk(full.slice(0, i));
      if (i >= full.length) return resolve();
      window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  });
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-2 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500"
          animate={{ y: [0, -3, 0], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </div>
  );
}

export default function AssistantChat() {
  const { isAuthenticated } = useAuth();
  const params = useParams();
  const projectId = useMemo(() => (params.id ? String(params.id) : ""), [params.id]);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      content: "Hi — I can help tighten bullets, suggest skills, or align your story to a job. What are you stuck on?",
    },
  ]);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open, busy]);

  if (!isAuthenticated) return null;

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);

    try {
      const data = await apiJson("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({ message: text, projectId }),
      });

      const reply = String(data?.reply || "");
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      await streamText(reply, (partial) => {
        setMessages((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = { role: "assistant", content: partial };
          return copy;
        });
      });
    } catch (e) {
      toast.error(e.message || "Assistant error");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry — I couldn’t reach the coach. Check your API key / network and try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-auto w-[min(92vw,420px)] overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/85 shadow-2xl shadow-indigo-500/20 ring-1 ring-indigo-500/10 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75 dark:shadow-black/45 dark:ring-white/10"
          >
            <div className="flex items-center justify-between border-b border-slate-200/70 bg-gradient-to-r from-indigo-600/10 via-fuchsia-600/10 to-violet-600/10 px-4 py-3 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">AI coach</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {projectId ? "Using this project as context." : "Tip: open a project for deeper answers."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200/80 bg-white/70 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200"
              >
                Close
              </button>
            </div>

            <div className="max-h-[min(52vh,420px)] space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={[
                    "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                    m.role === "user"
                      ? "ml-auto bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white"
                      : "mr-auto border border-slate-200/70 bg-white/80 text-slate-800 dark:border-slate-800 dark:bg-slate-950/45 dark:text-slate-100",
                  ].join(" ")}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </motion.div>
              ))}
              {busy ? (
                <div className="mr-auto inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/45 dark:text-slate-300">
                  <TypingDots />
                  Working…
                </div>
              ) : null}
              <div ref={endRef} />
            </div>

            <div className="border-t border-slate-200/70 p-3 dark:border-slate-800">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  placeholder="Ask: improve my summary, suggest skills, optimize for the JD…"
                  className="flex-1 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm outline-none ring-4 ring-transparent focus:border-indigo-400 focus:ring-indigo-500/15 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
                />
                <motion.button
                  type="button"
                  disabled={busy}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => void send()}
                  className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 disabled:opacity-60"
                >
                  Send
                </motion.button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Improve my resume", "Suggest skills", "Optimize for this job"].map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setInput(q);
                    }}
                    className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label="Open AI coach"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-sm font-extrabold text-white shadow-2xl shadow-indigo-500/35 ring-4 ring-white/40 dark:ring-slate-950/40"
      >
        AI
      </motion.button>
    </div>
  );
}
