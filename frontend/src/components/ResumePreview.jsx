import { motion } from "framer-motion";

export default function ResumePreview({ content }) {
  const hasContent = Boolean((content || "").trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-gradient-to-br from-white via-indigo-50/30 to-fuchsia-50/30 p-6 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/10 backdrop-blur dark:border-slate-800 dark:from-slate-950 dark:via-indigo-950/30 dark:to-fuchsia-950/20 dark:shadow-black/40 dark:ring-white/10"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-16 top-[-20%] h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-[-30%] left-[-10%] h-52 w-52 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>
      <pre className="relative font-sans text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-100">
        {hasContent ? content : "Nothing to show yet."}
      </pre>
    </motion.div>
  );
}
