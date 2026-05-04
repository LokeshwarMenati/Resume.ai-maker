import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { apiJson } from "../api/client.js";
import SkeletonList from "../components/SkeletonList.jsx";

const R = 54;
const C = 2 * Math.PI * R;

function ScoreRing({ value, label }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const offset = C - (v / 100) * C;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-40">
        <svg width="160" height="160" viewBox="0 0 120 120" className="-rotate-90">
          <defs>
            <linearGradient id="ringGrad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="55%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r={R} stroke="rgba(148,163,184,0.35)" strokeWidth="10" fill="none" />
          <motion.circle
            cx="60"
            cy="60"
            r={R}
            stroke="url(#ringGrad)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.p
            key={v}
            initial={{ scale: 0.92, opacity: 0.45 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display text-3xl font-extrabold text-slate-900 dark:text-white"
          >
            {v}
          </motion.p>
        </div>
      </div>
      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function CategoryBar({ label, value, delay }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const hue = v > 74 ? 150 : v > 49 ? 40 : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
        <span>{label}</span>
        <span>{v}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ delay, type: "spring", stiffness: 160, damping: 22 }}
          style={{
            background: `linear-gradient(90deg, hsl(${hue},92%,62%), hsl(${hue + 20},92%,72%))`,
          }}
        />
      </div>
    </div>
  );
}

export default function ResumeScore() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [jd, setJd] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoadingList(true);
      try {
        const rows = await apiJson("/projects");
        if (cancel) return;
        setProjects(rows);
        if (rows?.[0]?._id) setProjectId(String(rows[0]._id));
      } catch (e) {
        if (!cancel) toast.error(e.message);
      } finally {
        if (!cancel) setLoadingList(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const selectedTitle = useMemo(() => {
    const p = projects.find((x) => String(x._id) === String(projectId));
    return p?.title || "Selected project";
  }, [projects, projectId]);

  async function runScore() {
    if (!projectId) {
      toast.error("Pick a project first.");
      return;
    }
    setScoring(true);
    setResult(null);
    const p = toast.loading("Scoring with AI…");
    try {
      const data = await apiJson("/resume-score", {
        method: "POST",
        body: JSON.stringify({ projectId, jobDescription: jd }),
      });
      setResult(data);
      toast.success("Score ready", { id: p });
    } catch (e) {
      toast.error(e.message || "Could not score", { id: p });
    } finally {
      setScoring(false);
    }
  }

  if (loadingList) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800" />
        <SkeletonList rows={4} />
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Resume score dashboard</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Create a resume project first, then come back to score it.</p>
        <Link
          to="/app/projects/create"
          className="inline-flex rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25"
        >
          New project
        </Link>
      </div>
    );
  }

  const b = result?.breakdown || null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Resume score dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          This is model-assisted guidance (not a guarantee). Paste a JD for sharper keyword sensing.
        </p>
      </div>

      <div className="grid gap-4 rounded-[1.6rem] border border-slate-200/70 bg-white/70 p-5 shadow-xl shadow-indigo-500/10 backdrop-blur ring-1 ring-slate-200/65 dark:border-slate-800 dark:bg-slate-950/40 dark:shadow-black/35 dark:ring-white/10 md:grid-cols-3 md:items-end">
        <label className="md:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Project</span>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
          >
            {projects.map((p) => (
              <option key={p._id} value={String(p._id)}>
                {p.title}
              </option>
            ))}
          </select>
        </label>

        <div className="md:col-span-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Job description (optional)</span>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={4}
            placeholder="Paste the posting here for keyword alignment…"
            className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
          />
        </div>

        <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Selected: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTitle}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              to={projectId ? `/app/projects/${projectId}/form` : "/app/dashboard"}
              className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
            >
              Edit project
            </Link>
            <motion.button
              type="button"
              disabled={scoring}
              whileTap={{ scale: 0.98 }}
              onClick={() => void runScore()}
              className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 disabled:opacity-60"
            >
              {scoring ? "Scoring…" : "Run AI score"}
            </motion.button>
          </div>
        </div>
      </div>

      {result ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[1.6rem] border border-slate-200/70 bg-white/70 p-6 shadow-xl shadow-indigo-500/10 backdrop-blur ring-1 ring-slate-200/65 dark:border-slate-800 dark:bg-slate-950/40 dark:shadow-black/35 dark:ring-white/10 lg:col-span-1">
            <ScoreRing value={result.overall} label="Overall" />
            <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">Weighted signal from coach model</p>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200/70 bg-white/70 p-6 shadow-xl shadow-indigo-500/10 backdrop-blur ring-1 ring-slate-200/65 dark:border-slate-800 dark:bg-slate-950/40 dark:shadow-black/35 dark:ring-white/10 lg:col-span-2">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Breakdown</h2>
            <div className="mt-5 space-y-4">
              <CategoryBar label="ATS compatibility" value={b?.ats} delay={0.05} />
              <CategoryBar label="Keyword match" value={b?.keywords} delay={0.1} />
              <CategoryBar label="Formatting clarity" value={b?.formatting} delay={0.15} />
              <CategoryBar label="Impact / outcomes" value={b?.impact} delay={0.2} />
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200/70 bg-white/70 p-6 shadow-xl shadow-indigo-500/10 backdrop-blur ring-1 ring-slate-200/65 dark:border-slate-800 dark:bg-slate-950/40 dark:shadow-black/35 dark:ring-white/10 lg:col-span-3">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Top fixes</h2>
            <ul className="mt-4 space-y-2">
              {(result.notes || []).map((n, idx) => (
                <motion.li
                  key={`${idx}-${n}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  className="rounded-2xl border border-slate-200/70 bg-white/60 px-4 py-3 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-950/35 dark:text-slate-100"
                >
                  {n}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="rounded-[1.6rem] border border-dashed border-slate-300/80 bg-white/50 p-10 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-400">
          Run a score to see animated charts and actionable notes.
        </div>
      )}
    </div>
  );
}
