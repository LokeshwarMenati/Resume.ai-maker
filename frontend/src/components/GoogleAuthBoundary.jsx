import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

/** Wraps OAuth provider only when a web client ID is configured. */
export default function GoogleAuthBoundary({ children }) {
  if (!clientId) return children;
  return (
    <GoogleOAuthProvider clientId={clientId} onScriptLoadError={() => console.warn("Google Sign-In script failed to load.")}>
      {children}
    </GoogleOAuthProvider>
  );
}
