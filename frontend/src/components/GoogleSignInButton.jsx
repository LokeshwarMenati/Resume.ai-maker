import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiJson } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const googleClientConfigured = Boolean((import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim());
const useFedCmButton = import.meta.env.VITE_GOOGLE_USE_FEDCM === "true";

export default function GoogleSignInButton({ disabled }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark } = useTheme();

  if (!googleClientConfigured) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-center dark:border-slate-600 dark:bg-slate-950/60">
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          Add <code className="rounded bg-white px-1 py-0.5 text-[10px] text-slate-800 dark:bg-slate-900 dark:text-slate-200">VITE_GOOGLE_CLIENT_ID</code> to{" "}
          <code className="rounded bg-white px-1 py-0.5 text-[10px] text-slate-800 dark:bg-slate-900 dark:text-slate-200">frontend/.env</code> and the same value as{" "}
          <code className="rounded bg-white px-1 py-0.5 text-[10px] text-slate-800 dark:bg-slate-900 dark:text-slate-200">GOOGLE_CLIENT_ID</code> in{" "}
          <code className="rounded bg-white px-1 py-0.5 text-[10px] text-slate-800 dark:bg-slate-900 dark:text-slate-200">backend/.env</code>, then restart both dev
          servers.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center [&>div]:!w-full [&>div_div]:rounded-xl [&>div_button]:!w-full">
      <GoogleLogin
        key={isDark ? "g-dark" : "g-light"}
        type="standard"
        theme={isDark ? "filled_black" : "filled_blue"}
        shape="pill"
        size="large"
        text="continue_with"
        logo_alignment="left"
        ux_mode="popup"
        {...(useFedCmButton ? { use_fedcm_for_button: true } : {})}
        onSuccess={async (cred) => {
          if (!cred?.credential) {
            toast.error("Google did not return a credential.");
            return;
          }
          const p = toast.loading("Completing Google sign-in…");
          try {
            const data = await apiJson("/auth/google", {
              method: "POST",
              body: JSON.stringify({ credential: cred.credential }),
            });
            login(data);
            toast.success("Signed in with Google", { id: p });
            navigate("/app/dashboard", { replace: true });
          } catch (e) {
            const msg = e.message || "Google sign-in failed";
            toast.error(msg, { id: p, duration: 6000 });
            if (import.meta.env.DEV) {
              console.warn("[GoogleSignIn]", msg, e.data ?? e);
            }
          }
        }}
        onError={() => {
          const url = window.location.origin;
          console.warn(
            "[GoogleSignIn] Button error — often fixed by adding this exact origin in Google Cloud → OAuth → Web client → Authorized JavaScript origins:",
            url
          );
          toast.error(
            `Google could not start sign-in. Add "${url}" (and try http://localhost:5173 vs http://127.0.0.1:5173) under Authorized JavaScript origins.`,
            { duration: 8000 }
          );
        }}
        disabled={disabled}
      />
    </div>
  );
}
