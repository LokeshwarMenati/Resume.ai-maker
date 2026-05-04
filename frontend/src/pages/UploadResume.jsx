import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { API_BASE, authHeaders } from "../api/client.js";
import FileUploadCard from "../components/FileUploadCard.jsx";

export default function UploadResume() {
  const { id } = useParams();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function upload(file) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      fd.append("projectId", id);
      const res = await fetch(`${API_BASE}/upload-resume`, {
        method: "POST",
        headers: authHeaders(false),
        body: fd,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || `Upload failed (${res.status})`);
      setMessage(`Extracted ${data.totalLength.toLocaleString()} characters from PDF.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload existing resume</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          We merge PDF text with your structured form answers so the AI model has full context. PDF
          parsing can be imperfect—review the final draft carefully.
        </p>
      </div>
      <FileUploadCard disabled={busy} label="Choose PDF resume" onChoose={(f) => upload(f)} />
      {busy ? <p className="text-sm font-medium text-indigo-600">Reading PDF…</p> : null}
      {message ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p> : null}
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div className="flex gap-3 pt-4">
        <Link
          to={`/app/projects/${id}/job`}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Continue to job description →
        </Link>
        <Link to={`/app/projects/${id}/form`} className="text-sm font-semibold text-slate-600 underline">
          Back to form
        </Link>
      </div>
    </div>
  );
}
