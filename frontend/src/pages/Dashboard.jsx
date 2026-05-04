import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { apiJson } from "../api/client.js";
import SkeletonList from "../components/SkeletonList.jsx";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await apiJson("/projects");
        if (!cancel) setProjects(rows);
      } catch (e) {
        if (!cancel) {
          setError(e.message);
          toast.error(e.message);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/80" />
        </div>
        <SkeletonList rows={6} />
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Resume projects</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Each marker is one tailored timeline you refine for different roles.</p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/app/projects/create"
            className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
          >
            New project
          </Link>
        </motion.div>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300/80 bg-white/70 p-14 text-center shadow-inner shadow-slate-500/5 backdrop-blur dark:border-slate-700 dark:bg-slate-950/40">
          <p className="text-sm text-slate-600 dark:text-slate-400">Nothing here yet.</p>
          <Link to="/app/projects/create" className="mt-4 inline-block text-sm font-semibold text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-300">
            Create your first resume project →
          </Link>
        </div>
      ) : (
        <motion.ul layout className="divide-y divide-slate-100 overflow-hidden rounded-[1.65rem] border border-slate-200/75 bg-white/70 shadow-xl shadow-indigo-500/10 ring-1 ring-slate-200/65 backdrop-blur dark:divide-slate-800 dark:border-slate-800/70 dark:bg-slate-950/45 dark:shadow-black/35 dark:ring-white/10">
          {projects.map((p, i) => (
            <motion.li
              key={p._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              layout
              whileHover={{ y: -2 }}
            >
              <Link to={`/app/projects/${p._id}/form`} className="flex items-center justify-between gap-4 px-4 py-5 transition hover:bg-slate-50/80 dark:hover:bg-slate-900/55">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">{p.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Updated {new Date(p.updatedAt).toLocaleDateString()}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-indigo-600 transition group-hover:translate-x-1 dark:text-indigo-300">Open →</span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
