import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

/**
 * Lenis can interfere with normal document flow on simple pages (login/signup).
 * Only enable smooth scrolling inside the authenticated app shell.
 */
export default function SmoothScrollProvider({ children }) {
  const { pathname } = useLocation();
  const enableLenis = pathname.startsWith("/app");

  useEffect(() => {
    if (!enableLenis) return undefined;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.15,
    });

    let raf = 0;
    function tick(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [enableLenis]);

  return children;
}
