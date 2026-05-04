import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { API_BASE, apiJson, authHeaders } from "../api/client.js";

const STORAGE_KEY_PREFIX = "resume_builder_jd_";
const TONE_OPTIONS = ["professional", "confident", "friendly"];
const TEMPLATE_OPTIONS = ["formal", "modern"];
const IMPROVE_ACTIONS = [
  { id: "strengthen", label: "Make it stronger" },
  { id: "shorten", label: "Shorten this" },
  { id: "confident", label: "More confident tone" },
];

function splitParagraphs(text) {
  return String(text || "")
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function CoverLetter() {
  const { id } = useParams();
  const storageKey = `${STORAGE_KEY_PREFIX}${id}`;
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("professional");
  const [template, setTemplate] = useState("formal");
  const [busy, setBusy] = useState(false);
  const [coverLetterId, setCoverLetterId] = useState("");
  const [coverText, setCoverText] = useState("");
  const [draftText, setDraftText] = useState("");
  const [copied, setCopied] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [history, setHistory] = useState([]);
  const [revealCount, setRevealCount] = useState(0);

  const shownText = useMemo(() => coverText.slice(0, revealCount), [coverText, revealCount]);

  useEffect(() => {
    const saved = window.sessionStorage.getItem(storageKey);
    if (saved) setJobDescription(saved);
  }, [storageKey]);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const rows = await apiJson(`/cover-letter/project/${id}`);
        if (!live) return;
        setHistory(rows);
        if (rows[0]) {
          setCoverLetterId(rows[0]._id);
          setCoverText(rows[0].generatedText || "");
          setDraftText(rows[0].generatedText || "");
          setCompanyName(rows[0].companyName || "");
          setRoleTitle(rows[0].roleTitle || "");
          setTone(rows[0].tone || "professional");
          setTemplate(rows[0].template || "formal");
          if (!jobDescription && rows[0].jobDescription) setJobDescription(rows[0].jobDescription);
        }
      } catch {
        /* no history yet */
      }
    })();
    return () => {
      live = false;
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setRevealCount(0);
    if (!coverText) return;
    const timer = window.setInterval(() => {
      setRevealCount((n) => {
        const next = n + 10;
        if (next >= coverText.length) {
          window.clearInterval(timer);
          return coverText.length;
        }
        return next;
      });
    }, 12);
    return () => window.clearInterval(timer);
  }, [coverText]);

  async function refreshHistory() {
    const rows = await apiJson(`/cover-letter/project/${id}`);
    setHistory(rows);
  }

  async function generate() {
    if (!companyName.trim() || !jobDescription.trim()) {
      toast.error("Company name and job description are required.");
      return;
    }
    setRipple(true);
    window.setTimeout(() => setRipple(false), 420);
    setBusy(true);
    const t = toast.loading("Writing your cover letter...");
    try {
      window.sessionStorage.setItem(storageKey, jobDescription);
      const doc = await apiJson("/cover-letter/generate", {
        method: "POST",
        body: JSON.stringify({
          projectId: id,
          companyName,
          roleTitle,
          jobDescription,
          tone,
          template,
        }),
      });
      setCoverLetterId(doc._id);
      setCoverText(doc.generatedText || "");
      setDraftText(doc.generatedText || "");
      await refreshHistory();
      toast.success("Cover letter ready.", { id: t });
    } catch (e) {
      toast.error(e.message || "Could not generate cover letter", { id: t });
    } finally {
      setBusy(false);
    }
  }

  async function improve(action) {
    if (!coverLetterId) return;
    setBusy(true);
    const t = toast.loading("Refining draft...");
    try {
      const doc = await apiJson(`/cover-letter/${coverLetterId}/enhance`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      setCoverText(doc.generatedText || "");
      setDraftText(doc.generatedText || "");
      await refreshHistory();
      toast.success("Updated draft saved.", { id: t });
    } catch (e) {
      toast.error(e.message || "Enhancement failed", { id: t });
    } finally {
      setBusy(false);
    }
  }

  async function saveEdits() {
    if (!coverLetterId || !draftText.trim()) return;
    const t = toast.loading("Saving edits...");
    try {
      const doc = await apiJson(`/cover-letter/${coverLetterId}`, {
        method: "PUT",
        body: JSON.stringify({ generatedText: draftText }),
      });
      setCoverText(doc.generatedText || "");
      await refreshHistory();
      toast.success("Edits saved.", { id: t });
    } catch (e) {
      toast.error(e.message || "Could not save edits", { id: t });
    }
  }

  async function copyText() {
    if (!draftText.trim()) return;
    await navigator.clipboard.writeText(draftText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  async function downloadPdf() {
    if (!coverLetterId) return;
    const t = toast.loading("Preparing PDF...");
    try {
      const res = await fetch(`${API_BASE}/cover-letter-pdf/${coverLetterId}`, {
        headers: authHeaders(false),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Could not download PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cover-letter-${coverLetterId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded.", { id: t });
    } catch (e) {
      toast.error(e.message || "Could not download PDF", { id: t });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Cover letter generator</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Generate, refine, edit, and save one tailored letter per job target.</p>
        </div>
        <Link to={`/app/projects/${id}/preview`} className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-300">
          Back to resume preview
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4 rounded-[1.5rem] border border-slate-200/80 bg-white/70 p-5 shadow-xl shadow-indigo-500/10 backdrop-blur dark:border-slate-800 dark:bg-slate-950/45">
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company name *"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
          />
          <input
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="Role title (optional)"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
          />
          <div className="grid grid-cols-2 gap-3">
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900">
              {TONE_OPTIONS.map((x) => (
                <option key={x} value={x}>
                  Tone: {x}
                </option>
              ))}
            </select>
            <select value={template} onChange={(e) => setTemplate(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900">
              {TEMPLATE_OPTIONS.map((x) => (
                <option key={x} value={x}>
                  Template: {x}
                </option>
              ))}
            </select>
          </div>
          <textarea
            rows={11}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description *"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
          />

          <div className="relative">
            <motion.button
              type="button"
              onClick={generate}
              disabled={busy}
              whileHover={{ scale: busy ? 1 : 1.02 }}
              whileTap={{ scale: busy ? 1 : 0.98 }}
              className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Writing your cover letter..." : "Generate Cover Letter"}
              <AnimatePresence>
                {ripple ? (
                  <motion.span
                    initial={{ scale: 0, opacity: 0.45 }}
                    animate={{ scale: 8, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                  />
                ) : null}
              </AnimatePresence>
            </motion.button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Target length: 200-300 words, ATS-friendly, tailored to this role and company.</p>
        </div>

        <div className="space-y-3 rounded-[1.5rem] border border-slate-200/80 bg-white/70 p-5 shadow-xl shadow-indigo-500/10 backdrop-blur dark:border-slate-800 dark:bg-slate-950/45">
          <div className="flex flex-wrap gap-2">
            {IMPROVE_ACTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={!coverLetterId || busy}
                onClick={() => improve(item.id)}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-45 dark:border-slate-700 dark:text-slate-200"
              >
                {item.label}
              </button>
            ))}
          </div>

          <textarea
            rows={14}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="Your generated cover letter will appear here..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
          />

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={saveEdits} disabled={!coverLetterId || busy} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-45 dark:bg-slate-100 dark:text-slate-900">
              Save edits
            </button>
            <motion.button
              type="button"
              onClick={copyText}
              whileTap={{ scale: 0.95 }}
              disabled={!draftText.trim()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-45 dark:border-slate-700 dark:text-slate-200"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span key="ok" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}>
                    ✓ Copied
                  </motion.span>
                ) : (
                  <motion.span key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <button type="button" onClick={downloadPdf} disabled={!coverLetterId} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-45 dark:border-slate-700 dark:text-slate-200">
              Download as PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/70 p-5 shadow-xl shadow-indigo-500/10 backdrop-blur dark:border-slate-800 dark:bg-slate-950/45">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Live preview</h2>
          {!shownText ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Generate to preview with text reveal animation.</p>
          ) : (
            <div className="space-y-3 text-[15px] leading-7 text-slate-800 dark:text-slate-200">
              {splitParagraphs(shownText).map((p, i) => (
                <motion.p key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  {p}
                </motion.p>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/70 p-5 shadow-xl shadow-indigo-500/10 backdrop-blur dark:border-slate-800 dark:bg-slate-950/45">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Saved letters</h2>
          <div className="max-h-80 space-y-2 overflow-auto">
            {history.length === 0 ? <p className="text-sm text-slate-500 dark:text-slate-400">No saved letters yet.</p> : null}
            {history.map((h) => (
              <button
                key={h._id}
                type="button"
                onClick={() => {
                  setCoverLetterId(h._id);
                  setCoverText(h.generatedText || "");
                  setDraftText(h.generatedText || "");
                  setCompanyName(h.companyName || "");
                  setRoleTitle(h.roleTitle || "");
                  setTone(h.tone || "professional");
                  setTemplate(h.template || "formal");
                  setJobDescription(h.jobDescription || "");
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs dark:border-slate-700 dark:bg-slate-900"
              >
                <p className="font-semibold text-slate-800 dark:text-slate-100">{h.companyName || "Untitled company"}</p>
                <p className="truncate text-slate-500 dark:text-slate-400">{h.roleTitle || "Role not set"} • {h.tone}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
