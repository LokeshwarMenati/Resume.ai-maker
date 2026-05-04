import { Link, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import AssistantChat from "./AssistantChat.jsx";

function MobileProjectNav() {
  const location = useLocation();
  const match = location.pathname.match(/^\/app\/projects\/([^/]+)\/(?:form|upload|job|preview|cover-letter)/);
  const id = match?.[1];
  if (!id) return null;

  const base = `/app/projects/${id}`;
  const items = [
    ["Form", `${base}/form`],
    ["Upload", `${base}/upload`],
    ["Job", `${base}/job`],
    ["AI", `${base}/preview`],
    ["Cover", `${base}/cover-letter`],
  ];

  return (
    <nav className="sticky top-14 z-30 border-b border-slate-200/80 bg-slate-50/90 px-2 py-2 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70 lg:hidden">
      <div className="flex gap-1 overflow-x-auto text-[11px] font-semibold">
        {items.map(([label, to]) => (
          <Link
            key={to}
            to={to}
            className="shrink-0 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-slate-800 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/35">
      <Navbar />
      <MobileProjectNav />
      <div className="relative flex min-h-[calc(100vh-3.5rem)] flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -left-32 top-[-10%] h-72 w-72 rounded-full bg-fuchsia-500/15 blur-[100px]" />
            <div className="absolute right-[-20%] top-[20%] h-96 w-96 rounded-full bg-indigo-500/15 blur-[120px]" />
            <div className="absolute bottom-[-25%] left-[30%] h-96 w-96 rounded-full bg-violet-500/10 blur-[120px]" />
          </div>

          <div className="mx-auto max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <AssistantChat />
    </div>
  );
}
