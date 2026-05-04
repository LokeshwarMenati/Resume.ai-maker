import { NavLink, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSidebar } from "../context/SidebarContext.jsx";
import { apiJson } from "../api/client.js";

function labelShort(label) {
  return label.slice(0, 1).toUpperCase();
}

export default function Sidebar() {
  const { id } = useParams();
  const { collapsed } = useSidebar();
  const [recentProjects, setRecentProjects] = useState([]);
  const base = id ? `/app/projects/${id}` : "/app/dashboard";

  const items = [
    { to: "/app/dashboard", label: "Dashboard", short: "D", end: true },
    { to: "/app/score", label: "Resume score", short: "S", end: false },
  ];
  const projectSteps = [
    [`${base}/form`, "Resume form", "F"],
    [`${base}/upload`, "Upload PDF", "U"],
    [`${base}/job`, "Job description", "J"],
    [`${base}/preview`, "Generate & preview", "G"],
    [`${base}/cover-letter`, "Cover letter", "C"],
  ];

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const rows = await apiJson("/projects");
        if (!live) return;
        setRecentProjects(Array.isArray(rows) ? rows.slice(0, 4) : []);
      } catch {
        if (!live) return;
        setRecentProjects([]);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  const linkCls = ({ isActive }) =>
    [
      "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition",
      collapsed ? "justify-center px-2" : "",
      isActive
        ? "bg-indigo-500/15 text-indigo-800 shadow-sm ring-indigo-500/25 dark:bg-indigo-500/15 dark:text-indigo-200 dark:ring-indigo-400/25"
        : "text-slate-700 hover:bg-slate-100/80 hover:ring-slate-200 dark:text-slate-200 dark:hover:bg-slate-800/70 dark:hover:ring-white/10",
    ].join(" ");

  const widthVariants = collapsed ? "4.75rem" : "14rem";

  return (
    <motion.aside
      animate={{ width: widthVariants }}
      transition={{ type: "spring", stiffness: 520, damping: 40 }}
      className="relative hidden shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-white/60 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/45 lg:flex"
    >
      <nav className="flex flex-col gap-1 px-3 py-5">
        {items.map((item) => (
          <NavLink key={item.to} end={item.end} to={item.to} className={linkCls} title={item.label}>
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-white/70 text-[11px] font-black text-indigo-700 ring-1 ring-indigo-200/70 dark:bg-slate-900/70 dark:text-indigo-200 dark:ring-indigo-500/25">
              {labelShort(item.label)}
            </span>
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
          </NavLink>
        ))}
        {id ? (
          <div className="mt-2 space-y-1 border-t border-slate-200/70 pt-3 dark:border-slate-800/70">
            {projectSteps.map(([to, label, short]) => (
              <NavLink key={to} to={to} className={linkCls} title={label}>
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-white/70 text-[11px] font-black text-fuchsia-700 ring-1 ring-fuchsia-200/70 dark:bg-slate-900/70 dark:text-fuchsia-200 dark:ring-fuchsia-500/25">
                  {short}
                </span>
                {!collapsed ? <span className="truncate">{label}</span> : null}
              </NavLink>
            ))}
          </div>
        ) : !collapsed ? (
          <div className="mt-2 space-y-2 border-t border-slate-200/70 pt-3 dark:border-slate-800/70">
            <p className="px-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Pick a project to access form, upload, job tailoring, preview, and cover letter.
            </p>
            {recentProjects.map((p) => (
              <NavLink key={p._id} to={`/app/projects/${p._id}/form`} className={linkCls} title={p.title}>
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-white/70 text-[11px] font-black text-emerald-700 ring-1 ring-emerald-200/70 dark:bg-slate-900/70 dark:text-emerald-200 dark:ring-emerald-500/25">
                  P
                </span>
                <span className="truncate">{p.title}</span>
              </NavLink>
            ))}
          </div>
        ) : null}
      </nav>
    </motion.aside>
  );
}
