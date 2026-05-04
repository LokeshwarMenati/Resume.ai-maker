const raw =
  typeof import.meta.env.VITE_API_URL === "string" &&
  import.meta.env.VITE_API_URL.trim() !== ""
    ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
    : "";

/** Base URL — empty uses same-origin `/api` (Vite dev proxy → backend). */
export const API_BASE = raw ? `${raw}/api` : "/api";

function getStoredToken() {
  return window.localStorage.getItem("resume_builder_token") || "";
}

export function authHeaders(includeJson = true) {
  const h = {};
  const t = getStoredToken();
  if (t) h.Authorization = `Bearer ${t}`;
  if (includeJson) h["Content-Type"] = "application/json";
  return h;
}

export async function apiJson(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...authHeaders(!(options.body instanceof FormData)), ...options.headers },
    });
  } catch (e) {
    const msg =
      e?.message?.includes("Failed to fetch") || e?.name === "TypeError"
        ? "Cannot reach the API. Run the backend (npm run dev in resume-builder/backend) with MongoDB reachable, then use npm run dev in frontend — do not open the built index.html as a file."
        : e?.message || "Network error";
    throw new Error(msg);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON */
  }

  if (!res.ok) {
    const msg = data?.message || data?.errors?.[0]?.msg || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
