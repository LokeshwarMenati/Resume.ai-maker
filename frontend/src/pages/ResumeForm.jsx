import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { apiJson } from "../api/client.js";
import Spinner from "../components/Spinner.jsx";
import LiveResumePreview from "../components/LiveResumePreview.jsx";

const TOTAL_STEPS = 4;

const emptyEducation = () => ({
  institution: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
  details: "",
});

const emptyExperience = () => ({
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  bullets: "",
});

const emptyProject = () => ({
  name: "",
  description: "",
  technologies: "",
  url: "",
});

const emptyCert = () => ({
  name: "",
  issuer: "",
  date: "",
});

export default function ResumeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [personal, setPersonal] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    linkedin: "",
    website: "",
  });

  const [education, setEducation] = useState([emptyEducation()]);
  const [experience, setExperience] = useState([emptyExperience()]);
  const [skillsText, setSkillsText] = useState("");
  const [projectsList, setProjectsList] = useState([emptyProject()]);
  const [certs, setCerts] = useState([emptyCert()]);
  const [splitView, setSplitView] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await apiJson(`/projects/${id}`);
        if (cancel) return;
        setTitle(p.title || "");
        setPersonal((prev) => ({ ...prev, ...(p.personalDetails || {}) }));
        setEducation((p.education && p.education.length ? p.education : [emptyEducation()]).map((e) =>
          ({
            institution: e.institution || "",
            degree: e.degree || "",
            field: e.field || "",
            startDate: e.startDate || "",
            endDate: e.endDate || "",
            details: e.details || "",
          })
        ));
        const ex = (p.experience || []).length
          ? p.experience.map((x) => ({
              company: x.company || "",
              role: x.role || "",
              startDate: x.startDate || "",
              endDate: x.endDate || "",
              bullets: (x.bullets || []).join("\n"),
            }))
          : [emptyExperience()];
        setExperience(ex);
        setSkillsText((p.skills || []).join(", "));
        const pj = (p.projects || []).length
          ? p.projects.map((o) => ({
              name: o.name || "",
              description: o.description || "",
              technologies: o.technologies || "",
              url: o.url || "",
            }))
          : [emptyProject()];
        setProjectsList(pj);
        const c = (p.certifications || []).length
          ? p.certifications.map((z) => ({
              name: z.name || "",
              issuer: z.issuer || "",
              date: z.date || "",
            }))
          : [emptyCert()];
        setCerts(c);
      } catch (e) {
        if (!cancel) setError(e.message);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per id
  }, [id]);

  const payload = useMemo(() => {
    const skills = skillsText
      .split(/[,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      title: title.trim(),
      personalDetails: personal,
      education: education.filter((row) =>
        Object.values(row).some((v) => String(v).trim())
      ),
      skills,
      projects: projectsList.filter((row) =>
        Object.values(row).some((v) => String(v).trim())
      ),
      experience: experience
        .filter((row) => Object.entries(row).filter(([k]) => k !== "bullets").some(([, v]) => String(v).trim()))
        .map((row) => ({
          company: row.company,
          role: row.role,
          startDate: row.startDate,
          endDate: row.endDate,
          bullets: row.bullets
            ? row.bullets
                .split("\n")
                .map((b) => b.trim())
                .filter(Boolean)
            : [],
        })),
      certifications: certs.filter((row) =>
        Object.values(row).some((v) => String(v).trim())
      ),
    };
  }, [title, personal, education, experience, skillsText, projectsList, certs]);

  async function persist() {
    setSaving(true);
    setError(null);
    try {
      await apiJson(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner label="Opening project…" className="py-24" />;
  if (error && !title) return <p className="text-sm text-red-600">{error}</p>;

  function stepBadge(n) {
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          n === step ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        }`}
      >
        {n}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <button
            key={i + 1}
            type="button"
            onClick={() => setStep(i + 1)}
            className="inline-flex items-center gap-2 rounded-full border border-transparent px-2 py-1 hover:border-slate-200"
          >
            {stepBadge(i + 1)}
            <span className="hidden sm:inline">
              {["Profile", "Education", "Experience", "Skills & extras"][i]}
            </span>
          </button>
        ))}
      </div>

      <motion.div
        aria-hidden="true"
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
        initial={false}
      >
        <motion.div
          className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
          initial={false}
          animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          transition={{ type: "spring", stiffness: 160, damping: 24 }}
        />
      </motion.div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-200">{error}</p>
      ) : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/40 px-4 py-3 text-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/30 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Toggle a live preview while you edit (desktop). Mobile keeps a single column.
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-100">
          <input type="checkbox" className="accent-indigo-600" checked={splitView} onChange={(e) => setSplitView(e.target.checked)} />
          Live split preview
        </label>
      </div>

      <div className={splitView ? "lg:grid lg:grid-cols-2 lg:items-start lg:gap-6" : ""}>
        <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-indigo-500/5 ring-1 ring-slate-200/70 dark:border-slate-700 dark:bg-slate-900 dark:ring-white/10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Project & profile</h2>
            <div>
              <label className="text-xs font-medium text-slate-700">Project title</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            {["fullName", "email", "phone", "location"].map((key) => (
              <div key={key}>
                <label className="text-xs font-medium capitalize text-slate-700">
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={personal[key]}
                  onChange={(e) => setPersonal({ ...personal, [key]: e.target.value })}
                />
              </div>
            ))}
            <div>
              <label className="text-xs font-medium text-slate-700">LinkedIn</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={personal.linkedin}
                onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Website / portfolio</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={personal.website}
                onChange={(e) => setPersonal({ ...personal, website: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Professional summary</label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={personal.summary}
                onChange={(e) => setPersonal({ ...personal, summary: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Education</h2>
            {education.map((row, idx) => (
              <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {["institution", "degree", "field", "startDate", "endDate"].map((k) => (
                    <div key={k} className={k === "institution" ? "sm:col-span-2" : ""}>
                      <label className="text-xs font-medium capitalize text-slate-700">{k}</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        value={row[k]}
                        onChange={(e) => {
                          const next = [...education];
                          next[idx] = { ...next[idx], [k]: e.target.value };
                          setEducation(next);
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="text-xs font-medium text-slate-700">Highlights</label>
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    value={row.details}
                    onChange={(e) => {
                      const next = [...education];
                      next[idx] = { ...next[idx], details: e.target.value };
                      setEducation(next);
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    className="text-xs font-semibold text-red-600 hover:text-red-500"
                    onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="text-sm font-semibold text-indigo-600"
              onClick={() => setEducation([...education, emptyEducation()])}
            >
              + Add education
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Experience</h2>
            {experience.map((row, idx) => (
              <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {["company", "role", "startDate", "endDate"].map((k) => (
                    <div key={k} className={k === "company" ? "sm:col-span-2" : ""}>
                      <label className="text-xs font-medium capitalize text-slate-700">{k}</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        value={row[k]}
                        onChange={(e) => {
                          const next = [...experience];
                          next[idx] = { ...next[idx], [k]: e.target.value };
                          setExperience(next);
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="text-xs font-medium text-slate-700">Bullets (one per line)</label>
                  <textarea
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    value={row.bullets}
                    onChange={(e) => {
                      const next = [...experience];
                      next[idx] = { ...next[idx], bullets: e.target.value };
                      setExperience(next);
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    className="text-xs font-semibold text-red-600 hover:text-red-500"
                    onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="text-sm font-semibold text-indigo-600"
              onClick={() => setExperience([...experience, emptyExperience()])}
            >
              + Add role
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Skills, projects & certifications</h2>
            <div>
              <label className="text-xs font-medium text-slate-700">Skills (comma separated)</label>
              <textarea
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
              />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Projects</h3>
            {projectsList.map((row, idx) => (
              <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                {["name", "technologies", "url"].map((k) => (
                  <div key={k} className="mt-2 first:mt-0">
                    <label className="text-xs font-medium capitalize text-slate-700">{k}</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      value={row[k]}
                      onChange={(e) => {
                        const next = [...projectsList];
                        next[idx] = { ...next[idx], [k]: e.target.value };
                        setProjectsList(next);
                      }}
                    />
                  </div>
                ))}
                <div className="mt-2">
                  <label className="text-xs font-medium text-slate-700">Description</label>
                  <textarea
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    value={row.description}
                    onChange={(e) => {
                      const next = [...projectsList];
                      next[idx] = { ...next[idx], description: e.target.value };
                      setProjectsList(next);
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    className="text-xs font-semibold text-red-600 hover:text-red-500"
                    onClick={() => setProjectsList(projectsList.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="text-sm font-semibold text-indigo-600"
              onClick={() => setProjectsList([...projectsList, emptyProject()])}
            >
              + Add project
            </button>

            <h3 className="pt-4 text-sm font-semibold text-slate-800 dark:text-slate-100">Certifications</h3>
            {certs.map((row, idx) => (
              <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                {["name", "issuer", "date"].map((k) => (
                  <div key={k} className="mt-2 first:mt-0">
                    <label className="text-xs font-medium capitalize text-slate-700">{k}</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      value={row[k]}
                      onChange={(e) => {
                        const next = [...certs];
                        next[idx] = { ...next[idx], [k]: e.target.value };
                        setCerts(next);
                      }}
                    />
                  </div>
                ))}
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    className="text-xs font-semibold text-red-600 hover:text-red-500"
                    onClick={() => setCerts(certs.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="text-sm font-semibold text-indigo-600"
              onClick={() => setCerts([...certs, emptyCert()])}
            >
              + Add certification
            </button>
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Back
          </button>
        ) : (
          <span />
        )}
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              try {
                await persist();
                setStep((s) => s + 1);
              } catch {
                /* persist surfaced error */
              }
            }}
            className="rounded-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save & next"}
          </button>
        ) : (
          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              try {
                await persist();
                navigate(`/app/projects/${id}/upload`);
              } catch {
                /* persist surfaced error */
              }
            }}
            className="rounded-lg bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save & go to upload"}
          </button>
        )}
      </div>
        </div>

        {splitView ? (
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <LiveResumePreview
                title={title}
                personal={personal}
                education={education}
                experience={experience}
                skillsText={skillsText}
                projectsList={projectsList}
                certs={certs}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
