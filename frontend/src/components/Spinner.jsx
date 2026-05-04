export default function Spinner({ label = "Loading…", className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"
        role="status"
      />
      {label ? <p className="text-sm font-medium text-slate-600">{label}</p> : null}
    </div>
  );
}
