import { Suspense, lazy, useEffect, useRef } from "react";

const HeroScene3D = lazy(() => import("./three/HeroScene3D.jsx"));

export default function LandingThreeBackdrop() {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function onMove(e) {
      const x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const y = -(e.clientY / Math.max(1, window.innerHeight)) * 2 + 1;
      mouse.current.x = x;
      mouse.current.y = y;
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-[-18%] top-[-12%] -z-[6] h-[760px] opacity-90">
      <Suspense fallback={null}>
        <HeroScene3D mouse={mouse} />
      </Suspense>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-slate-50 dark:from-slate-950/40 dark:to-slate-950" />
    </div>
  );
}
