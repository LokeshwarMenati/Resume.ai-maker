/** Simple skeleton placeholders for dashboard loading */
export default function SkeletonList({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/40"
        >
          <div className="h-4 w-1/3 rounded-lg bg-slate-200/80 dark:bg-slate-800" />
          <div className="mt-3 h-3 w-1/4 rounded-lg bg-slate-200/60 dark:bg-slate-800/80" />
        </div>
      ))}
    </div>
  );
}
