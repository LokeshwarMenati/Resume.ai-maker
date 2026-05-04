/** Floating label inputs for auth / quick forms */

export default function FloatingField({
  label,
  type = "text",
  autoComplete,
  required,
  value,
  onChange,
  minLength,
}) {
  const filled = Boolean(String(value ?? "").trim());
  const id = typeof label === "string" ? `ff-${label.replace(/\s+/g, "-").toLowerCase()}` : "ff-field";

  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer block w-full rounded-2xl border border-slate-200 bg-white px-4 pb-3 pt-5 text-sm shadow-sm outline-none ring-4 ring-transparent transition focus:border-indigo-400 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-[1.125rem] top-1 origin-left text-xs transition-all duration-150 peer-placeholder-shown:translate-y-[0.625rem] peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-[0.85] peer-not-placeholder-shown:-translate-y-2 peer-not-placeholder-shown:scale-[0.85] ${
          filled
            ? "font-semibold text-indigo-600 dark:text-indigo-300"
            : "font-medium text-slate-500 peer-focus:text-indigo-600 dark:text-slate-400 dark:peer-focus:text-indigo-300"
        }`}
      >
        {label}
      </label>
    </div>
  );
}
