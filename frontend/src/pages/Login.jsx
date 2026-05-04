import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { apiJson } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import FloatingField from "../components/FloatingField.jsx";
import GoogleSignInButton from "../components/GoogleSignInButton.jsx";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />;

  async function submit(e) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    setBusy(true);
    try {
      const data = await apiJson("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      login(data);
      toast.success("Welcome back!");
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4">
      <h1 className="text-center font-display text-3xl font-extrabold text-slate-900 dark:text-white">Welcome back</h1>
      <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">Log in to continue building resumes.</p>

      <div className="mt-10 space-y-5 rounded-[1.75rem] border border-white/60 bg-white/70 p-7 shadow-xl shadow-indigo-500/10 backdrop-blur-xl ring-1 ring-slate-200/70 dark:border-slate-800/70 dark:bg-slate-950/55 dark:shadow-indigo-500/15 dark:ring-white/10">
        <form onSubmit={submit} className="space-y-5">
          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-200">{error}</p> : null}

          <FloatingField label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <FloatingField label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />

          <motion.button
            type="submit"
            disabled={busy}
            whileHover={{ scale: busy ? 1 : 1.02 }}
            whileTap={{ scale: busy ? 1 : 0.98 }}
            className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-70"
          >
            {busy ? "Signing in…" : "Continue"}
          </motion.button>
        </form>

        <div className="relative py-3">
          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 border-t border-slate-200 dark:border-slate-800" />
          <span className="relative z-10 mx-auto block w-fit bg-white/90 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 backdrop-blur dark:bg-slate-950/80 dark:text-slate-400">
            Or
          </span>
        </div>

        <GoogleSignInButton disabled={busy} />
      </div>

      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        No account yet?{" "}
        <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">
          Create one
        </Link>
      </p>
    </motion.div>
  );
}
