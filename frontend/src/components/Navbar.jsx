import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { useSidebar } from "../context/SidebarContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import Brand3DChip from "./Brand3DChip.jsx";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const { collapsed, toggleCollapsed } = useSidebar();

  const inAppShell = location.pathname.startsWith("/app");
  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl backdrop-saturate-150 dark:border-slate-800/70 dark:bg-slate-950/70">
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scaleX: 0.4 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="h-[2px] w-full origin-left bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400"
      />
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          {isAuthenticated && inAppShell ? (
            <motion.button
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={toggleCollapsed}
              title="Toggle sidebar"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="relative hidden rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-semibold text-slate-200 shadow-sm shadow-black/20 lg:inline-flex"
            >
              {collapsed ? "»" : "«"}
            </motion.button>
          ) : null}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <NavLink
              to="/"
              className="group relative inline-flex items-center gap-2 rounded-2xl px-2 py-1 transition duration-300 hover:bg-white/5"
            >
              <Brand3DChip />
              <span className="relative text-base font-semibold tracking-tight text-white transition duration-300 group-hover:text-indigo-200 sm:text-lg">
                Resume Marker
                {isHome ? (
                  <span className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.65)]" />
                ) : null}
              </span>
              <motion.span
                animate={{ opacity: [0.75, 1, 0.75], scale: [1, 1.03, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="hidden rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-300 ring-1 ring-inset ring-emerald-400/20 sm:inline"
              >
                AI
              </motion.span>
            </NavLink>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3"
        >
          <div className="rounded-full border border-white/10 bg-white/5 p-0.5 shadow-lg shadow-black/20">
            <ThemeToggle />
          </div>
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-3 sm:flex">
                {user?.profilePicture ? (
                  <img
                    alt=""
                    src={user.profilePicture}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full border border-white/10 object-cover shadow-sm shadow-black/20"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-emerald-500/20 text-xs font-bold text-emerald-200 shadow-sm shadow-black/20">
                    {(user?.name?.[0] || user?.email?.[0] || "?").toUpperCase()}
                  </div>
                )}
                <span className="max-w-[200px] truncate text-sm text-slate-300">{user?.email}</span>
              </div>
              <motion.button
                type="button"
                onClick={logout}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 text-sm font-semibold text-rose-100 shadow-sm shadow-black/20 transition hover:bg-rose-500/20"
              >
                Log out
              </motion.button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="text-sm font-semibold text-slate-300 transition hover:text-indigo-300"
              >
                Log in
              </NavLink>
              <NavLink to="/signup">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-3 py-1.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25"
                >
                  Sign up
                </motion.span>
              </NavLink>
            </>
          )}
        </motion.div>
      </div>
    </header>
  );
}
