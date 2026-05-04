import { motion } from "framer-motion";

/**
 * Lightweight pseudo-3D brand chip for navbar branding.
 * Uses layered gradients + rotateX/rotateY to avoid heavy canvas in top nav.
 */
export default function Brand3DChip() {
  return (
    <motion.span
      aria-hidden="true"
      className="relative inline-flex h-6 w-6 shrink-0 [perspective:800px]"
      initial={{ rotateX: -18, rotateY: 22 }}
      animate={{ rotateX: [-18, -8, -18], rotateY: [22, -12, 22] }}
      transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="absolute inset-0 rounded-md bg-slate-950/18 blur-[6px] dark:bg-white/10" />
      <motion.span
        className="relative block h-full w-full rounded-md bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_8px_20px_rgba(99,102,241,0.4)] [transform-style:preserve-3d]"
        animate={{ rotateZ: [0, 10, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-white/70 [transform:translateZ(12px)]" />
        <span className="absolute inset-[4px] rounded-[6px] border border-white/30 [transform:translateZ(8px)]" />
      </motion.span>
    </motion.span>
  );
}
