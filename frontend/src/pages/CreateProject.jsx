import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiJson } from "../api/client.js";

export default function CreateProject() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const project = await apiJson("/projects", {
        method: "POST",
        body: JSON.stringify({ title: title.trim() }),
      });
      navigate(`/app/projects/${project._id}/form`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create resume project</h1>
        <p className="mt-2 text-sm text-slate-600">
          Pick a recognizable name—typically the role title you are targeting next.
        </p>
      </div>
      <form onSubmit={submit} className="max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <div>
          <label className="text-xs font-medium text-slate-700">Title</label>
          <input
            required
            placeholder="Senior Product Analyst — Fintech"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70"
        >
          {busy ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
