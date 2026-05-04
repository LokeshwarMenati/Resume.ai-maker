import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const templates = [
  { id: "modern", label: "Modern" },
  { id: "minimal", label: "Minimal" },
  { id: "neon", label: "Neon" },
];

function skillsFromText(skillsText) {
  return skillsText
    .split(/[,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function LiveResumePreview({
  title,
  personal,
  education,
  experience,
  skillsText,
  projectsList,
  certs,
}) {
  const [template, setTemplate] = useState("modern");
  const [flash, setFlash] = useState(false);

  const fingerprint = useMemo(() => {
    const skills = skillsFromText(skillsText);
    return JSON.stringify({
      title,
      personal,
      education,
      experience,
      skills,
      projectsList,
      certs,
    });
  }, [title, personal, education, experience, skillsText, projectsList, certs]);

  useEffect(() => {
    setFlash(true);
    const t = window.setTimeout(() => setFlash(false), 520);
    return () => window.clearTimeout(t);
  }, [fingerprint]);

  const skills = skillsFromText(skillsText);

  const shell =
    template === "minimal"
      ? "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
      : template === "neon"
        ? "border-indigo-400/40 bg-slate-950 text-slate-100 shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_25px_90px_rgba(99,102,241,0.18)]"
        : "border-slate-200/80 bg-gradient-to-br from-white via-indigo-50/35 to-fuchsia-50/25 text-slate-900 dark:border-slate-800 dark:from-slate-950 dark:via-indigo-950/25 dark:to-fuchsia-950/15 dark:text-slate-100";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Live preview</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Updates as you edit this project.</p>
        </div>
        <div className="inline-flex rounded-full border border-slate-200/70 bg-white/70 p-1 backdrop-blur dark:border-slate-800 dark:bg-slate-950/60">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplate(t.id)}
              className={[
                "rounded-full px-3 py-1 text-[11px] font-semibold transition",
                template === t.id
                  ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        layout
        className={[
          "relative overflow-hidden rounded-[1.6rem] border p-5 shadow-xl ring-1 backdrop-blur",
          shell,
          template === "neon" ? "ring-indigo-500/30" : "ring-slate-200/60 dark:ring-white/10",
          flash ? "shadow-indigo-500/25" : "",
        ].join(" ")}
        animate={
          flash
            ? { boxShadow: "0 0 0 1px rgba(99,102,241,0.35), 0 25px 90px rgba(99,102,241,0.18)" }
            : { boxShadow: "0 18px 60px rgba(15,23,42,0.12)" }
        }
        transition={{ duration: 0.45 }}
      >
        <motion.div key={fingerprint} initial={{ opacity: 0.35, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <header className="border-b border-slate-200/70 pb-4 dark:border-slate-800">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Résumé</p>
              <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight">{personal.fullName?.trim() || "Your name"}</h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{title?.trim() || "Target role / project title"}</p>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                {personal.email ? <span>{personal.email}</span> : null}
                {personal.phone ? <span>{personal.phone}</span> : null}
                {personal.location ? <span>{personal.location}</span> : null}
                {personal.linkedin ? <span>LinkedIn</span> : null}
                {personal.website ? <span>Portfolio</span> : null}
              </div>
            </header>

            {personal.summary?.trim() ? (
              <section className="mt-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Summary</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-200">{personal.summary}</p>
              </section>
            ) : null}

            {skills.length ? (
              <section className="mt-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Skills</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.slice(0, 24).map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-slate-200/80 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            {experience.some((x) => x.company?.trim() || x.role?.trim()) ? (
              <section className="mt-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Experience</h3>
                <div className="mt-2 space-y-3">
                  {experience
                    .filter((x) => x.company?.trim() || x.role?.trim())
                    .map((x, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200/70 bg-white/40 p-3 dark:border-slate-800 dark:bg-slate-950/30">
                        <p className="text-sm font-semibold">
                          {x.role?.trim() || "Role"} {x.company?.trim() ? `· ${x.company.trim()}` : ""}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {x.startDate?.trim() || "—"} — {x.endDate?.trim() || "—"}
                        </p>
                        {x.bullets?.trim() ? (
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700 dark:text-slate-200">
                            {x.bullets
                              .split("\n")
                              .map((b) => b.trim())
                              .filter(Boolean)
                              .slice(0, 6)
                              .map((b) => (
                                <li key={b}>{b}</li>
                              ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                </div>
              </section>
            ) : null}

            {education.some((e) => e.institution?.trim()) ? (
              <section className="mt-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Education</h3>
                <div className="mt-2 space-y-2">
                  {education
                    .filter((e) => e.institution?.trim())
                    .map((e, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="font-semibold">{e.institution}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {e.degree} {e.field ? `· ${e.field}` : ""}
                        </p>
                      </div>
                    ))}
                </div>
              </section>
            ) : null}

            {projectsList.some((p) => p.name?.trim()) ? (
              <section className="mt-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Projects</h3>
                <div className="mt-2 space-y-2">
                  {projectsList
                    .filter((p) => p.name?.trim())
                    .map((p, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200/70 bg-white/40 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/30">
                        <p className="font-semibold">{p.name}</p>
                        {p.description?.trim() ? <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-200">{p.description}</p> : null}
                        {p.technologies?.trim() ? <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{p.technologies}</p> : null}
                      </div>
                    ))}
                </div>
              </section>
            ) : null}

            {certs.some((c) => c.name?.trim()) ? (
              <section className="mt-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Certifications</h3>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  {certs
                    .filter((c) => c.name?.trim())
                    .map((c, idx) => (
                      <li key={idx}>
                        {c.name} {c.issuer ? `· ${c.issuer}` : ""} {c.date ? `(${c.date})` : ""}
                      </li>
                    ))}
                </ul>
              </section>
            ) : null}
        </motion.div>
      </motion.div>
    </div>
  );
}
