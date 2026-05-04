import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function FileUploadCard({
  label = "Drop PDF here",
  helper = "Maximum 5MB · drag & drop supported",
  disabled,
  accept = "application/pdf",
  onChoose,
}) {
  const [dragOver, setDragOver] = useState(false);

  const pick = useCallback(
    (file) => {
      if (disabled) return;
      if (file && onChoose) onChoose(file);
    },
    [disabled, onChoose]
  );

  return (
    <label
      onDragEnter={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled) return;
        const f = e.dataTransfer.files?.[0];
        if (f && f.type === "application/pdf") pick(f);
      }}
      className={[
        "relative block cursor-pointer overflow-hidden rounded-[1.5rem] border-2 border-dashed p-10 text-center transition",
        disabled
          ? "pointer-events-none border-slate-200 bg-slate-50/40 opacity-60 dark:border-slate-800 dark:bg-slate-950/30"
          : dragOver
            ? "border-indigo-400 bg-indigo-50/40 shadow-lg shadow-indigo-500/15 dark:border-indigo-400 dark:bg-indigo-950/30"
            : "border-slate-200/80 bg-white/60 hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-950/25",
      ].join(" ")}
    >
      <input
        type="file"
        className="sr-only"
        accept={accept}
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pick(f);
          e.target.value = "";
        }}
      />

      <AnimatePresence>
        {dragOver ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-fuchsia-500/10"
          />
        ) : null}
      </AnimatePresence>

      <motion.div animate={dragOver ? { scale: 1.02 } : { scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 28 }}>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{helper}</p>
      </motion.div>
    </label>
  );
}
