import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { API_BASE, authHeaders } from "../api/client.js";
import Spinner from "../components/Spinner.jsx";
import ResumePreview from "../components/ResumePreview.jsx";

const STORAGE_KEY_PREFIX = "resume_builder_jd_";

export default function PreviewResume() {
  const { id } = useParams();
  const storageKey = `${STORAGE_KEY_PREFIX}${id}`;

  const [jobDescription, setJobDescription] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [generationId, setGenerationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setJobDescription(window.sessionStorage.getItem(storageKey) || "");
  }, [storageKey]);

  async function regenerate() {
    setLoading(true);
    setError(null);
    const p = toast.loading("Crafting ATS-friendly narrative…");
    try {
      const body = JSON.stringify({
        projectId: id,
        jobDescription,
      });
      const res = await fetch(`${API_BASE}/generate-resume`, {
        method: "POST",
        headers: authHeaders(),
        body,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || `Generation failed (${res.status})`);
      setGeneratedText(data.generatedText);
      setGenerationId(data.id);
      toast.success("Draft ready — review before sending.", { id: p });
    } catch (e) {
      toast.error(e.message, { id: p });
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    if (!generationId) return;
    const p = toast.loading("Preparing PDF…");
    try {
      const res = await fetch(`${API_BASE}/resume-pdf/${generationId}`, {
        headers: authHeaders(false),
      });
      if (!res.ok) {
        let msg = "Could not download PDF";
        try {
          const err = await res.json();
          if (err?.message) msg = err.message;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${generationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded", { id: p });
    } catch (e) {
      toast.error(e.message, { id: p });
      setError(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Generate & preview</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Tune the posting on the{" "}
          <Link className="font-semibold text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-300" to={`/app/projects/${id}/job`}>
            job description
          </Link>{" "}
          page first, then run the model.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <motion.button
          type="button"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.03 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          onClick={regenerate}
          className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-55"
        >
          {loading ? "Generating…" : generatedText ? "Regenerate with AI" : "Generate resume"}
        </motion.button>
        <motion.button
          type="button"
          disabled={!generationId || loading}
          whileHover={{ scale: !generationId || loading ? 1 : 1.03 }}
          whileTap={{ scale: !generationId || loading ? 1 : 0.98 }}
          onClick={downloadPdf}
          className="rounded-2xl border border-slate-200/75 bg-white/70 px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:bg-white disabled:opacity-45 dark:border-slate-700 dark:bg-slate-950/45 dark:text-slate-100 dark:hover:bg-slate-950/70"
        >
          Download PDF
        </motion.button>
        <Link
          to="/app/dashboard"
          className="inline-flex items-center rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-600 underline-offset-4 hover:underline dark:text-slate-400"
        >
          ← Dashboard
        </Link>
        <Link
          to={`/app/projects/${id}/cover-letter`}
          className="inline-flex items-center rounded-2xl border border-fuchsia-200/80 bg-gradient-to-r from-white via-fuchsia-50 to-white px-4 py-2.5 text-sm font-semibold text-fuchsia-700 shadow-sm shadow-fuchsia-500/10 transition hover:-translate-y-0.5 hover:border-fuchsia-300 hover:shadow-md dark:border-fuchsia-500/20 dark:from-slate-950/45 dark:via-slate-950/70 dark:to-slate-950/45 dark:text-fuchsia-200"
        >
          Cover letter →
        </Link>
      </div>

      <div className="rounded-[1.5rem] border border-fuchsia-200/70 bg-gradient-to-r from-fuchsia-50 via-white to-indigo-50 p-5 shadow-lg shadow-fuchsia-500/10 backdrop-blur dark:border-fuchsia-500/20 dark:from-slate-950/55 dark:via-slate-950/45 dark:to-slate-900/45">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-700 dark:text-fuchsia-300">
              Next step
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold text-slate-900 dark:text-white">
              Generate a tailored cover letter for this project
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Use the same profile, job description, company name, and tone to create a cover letter that matches the resume draft.
            </p>
          </div>
          <Link
            to={`/app/projects/${id}/cover-letter`}
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Open cover letter generator
          </Link>
        </div>
      </div>

      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/55 dark:text-red-200">{error}</p> : null}

      {loading ? (
        <div className="rounded-[1.5rem] border border-slate-200/75 bg-white/60 p-10 backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
          <Spinner label="Analyzing JD + tailoring narrative…" className="" />
          <motion.div
            aria-hidden="true"
            className="relative mx-auto mt-8 h-1.5 max-w-xl overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            <motion.div
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500"
              animate={{ x: ["-40%", "120%"] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      ) : null}

      {!loading && generatedText ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <ResumePreview content={generatedText} />
        </motion.div>
      ) : null}
    </div>
  );
}
