import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const STORAGE_KEY_PREFIX = "resume_builder_jd_";

export default function JobDescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const storageKey = `${STORAGE_KEY_PREFIX}${id}`;

  useEffect(() => {
    const saved = window.sessionStorage.getItem(storageKey);
    if (saved) setText(saved);
  }, [storageKey]);

  function continueNext() {
    window.sessionStorage.setItem(storageKey, text);
    navigate(`/app/projects/${id}/preview`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Job description</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Paste the posting verbatim. The generator will align phrasing and keywords responsibly with
          what you have already provided.
        </p>
      </div>
      <textarea
        rows={14}
        placeholder="Paste job description here…"
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-inner outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={continueNext}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Continue to generation →
        </button>
        <Link
          to={`/app/projects/${id}/upload`}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          ← Back
        </Link>
      </div>
    </div>
  );
}
