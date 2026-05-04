import { useEffect, useState } from "react";

/** Soft cursor-follow highlight for hero sections; does not capture pointer events. */
export default function MouseSpotlight({ className = "" }) {
  const [pos, setPos] = useState({ x: 50, y: 38 });

  useEffect(() => {
    function onMove(e) {
      const x = (e.clientX / Math.max(1, window.innerWidth)) * 100;
      const y = (e.clientY / Math.max(1, window.innerHeight)) * 100;
      setPos({ x, y });
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className={["pointer-events-none absolute inset-0 -z-[1] overflow-hidden", className].join(" ")}>
      <div
        className="absolute h-[120%] w-[120%] -translate-x-[10%] -translate-y-[10%] opacity-70 blur-3xl dark:opacity-55"
        style={{
          background: `radial-gradient(420px circle at ${pos.x}% ${pos.y}%, rgba(99,102,241,0.22), transparent 55%), radial-gradient(520px circle at ${100 - pos.x}% ${100 - pos.y}%, rgba(236,72,153,0.14), transparent 58%)`,
        }}
      />
    </div>
  );
}
