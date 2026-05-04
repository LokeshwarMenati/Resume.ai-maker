import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <motion.button
      type="button"
      aria-label={`Switch theme (current ${theme})`}
      onClick={toggleTheme}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={[
        "relative inline-flex h-9 w-[4.75rem] items-center rounded-full border border-slate-200 bg-white px-1 text-xs font-semibold text-slate-700 shadow-inner dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
        className,
      ].join(" ")}
    >
      <motion.span
        layout
        className="pointer-events-none absolute left-1 top-1 bottom-1 w-[calc(50%-2px)] rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 shadow"
        animate={{ x: isDark ? "100%" : 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
      />
      <span className="relative z-10 mx-auto grid w-full grid-cols-2 px-2 text-[11px]">
        <span className={`text-center ${!isDark ? "text-white" : "opacity-65"}`}>Light</span>
        <span className={`text-center ${isDark ? "text-white" : "opacity-65"}`}>Dark</span>
      </span>
    </motion.button>
  );
}
