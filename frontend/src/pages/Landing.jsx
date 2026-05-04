import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
 

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden pb-28">
      <motion.section
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: reduceMotion ? 0 : 0.12 } },
        }}
        className="relative mx-auto max-w-6xl px-4 pt-8 sm:pt-14 lg:px-8"
      >
        <motion.div variants={fadeUp} transition={{ duration: 0.45 }} className="mb-5 inline-flex items-center rounded-full border border-white/70 bg-white/70 px-4 py-2 shadow-lg shadow-indigo-500/10 backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
          <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white sm:text-base">Resume Marker AI</span>
        </motion.div>

        <motion.div variants={fadeUp} transition={{ duration: 0.55 }} className="max-w-3xl text-left">
          <motion.h1
            animate={
              reduceMotion
                ? undefined
                : {
                    opacity: [1, 0.8, 1],
                    textShadow: [
                      "0 0 8px rgba(99,102,241,0.25)",
                      "0 0 24px rgba(236,72,153,0.45)",
                      "0 0 8px rgba(99,102,241,0.25)",
                    ],
                  }
            }
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="max-w-3xl text-balance text-[3.15rem] font-black leading-[1.08] tracking-tight text-transparent bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 bg-clip-text dark:from-indigo-300 dark:via-fuchsia-300 dark:to-cyan-200 sm:text-[4.65rem] lg:text-[5.85rem]"
          >
            Build Job-Winning Resumes in Seconds with AI
          </motion.h1>

          <p className="mt-7 max-w-2xl text-pretty text-left text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
            Drop an old résumé, outline your achievements, paste a posting, get a tightened draft that mirrors the JD, then export a crisp PDF instantly.
          </p>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:justify-start">
            <Link
              to={isAuthenticated ? "/app/dashboard" : "/signup"}
              className="inline-flex w-full max-w-sm items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition duration-300 hover:-translate-y-0.5 hover:brightness-[1.06] sm:w-auto"
            >
              {isAuthenticated ? "Open dashboard" : "Get started free"}
            </Link>
            <Link
              to="/login"
              className="w-full rounded-2xl border border-slate-200/70 bg-white/70 px-8 py-3.5 text-center text-sm font-semibold text-slate-800 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-950/65 dark:text-slate-100 sm:w-auto"
            >
              I already have an account
            </Link>
          </div>
        </motion.div>
      </motion.section>

      <LandingFeatures />
      <LandingHow />
      <LandingTestimonials />
      <LandingFooter />
    </div>
  );
}

function LandingFeatures() {
  const reduceMotion = useReducedMotion();
  const items = [
    {
      title: "AI-tailored drafts",
      body: "We blend structured profile facts, uploaded résumé text, and JD keywords responsibly—optimized for skim reading.",
    },
    {
      title: "ATS-oriented structure",
      body: "Plain, sectioned narratives that parse cleanly—and still read strong to hiring managers reviewing fast.",
    },
    {
      title: "Job-aligned phrasing",
      body: "Each project stores a JD so you can generate multiple resumes for different postings without overwriting everything.",
    },
  ];

  return (
    <section className="mx-auto mt-20 max-w-6xl px-4 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-12%" }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: reduceMotion ? 0 : 0.12 } },
        }}
        className="grid gap-6 md:grid-cols-3"
      >
        {items.map((f) => (
          <motion.div
            key={f.title}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
            whileHover={
              reduceMotion
                ? undefined
                : { y: -6, rotateX: -1, boxShadow: "0 24px 80px rgba(76,29,149,0.18)" }
            }
            className="group rounded-[1.65rem] border border-white/60 bg-white/70 p-6 shadow-xl shadow-indigo-500/10 backdrop-blur-xl ring-1 ring-slate-200/70 dark:border-slate-800/70 dark:bg-slate-950/55 dark:shadow-indigo-500/15 dark:ring-white/10"
          >
            <div className="mb-4 inline-flex h-10 items-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 px-3 text-[11px] font-bold uppercase tracking-widest text-indigo-800 dark:text-indigo-100">
              Feature
            </div>
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{f.body}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function LandingHow() {
  const reduceMotion = useReducedMotion();
  const steps = [
    { k: "1", title: "Capture your baseline", detail: "Form + PDF upload merges raw signal with curated fields." },
    { k: "2", title: "Drop the job description", detail: "The model aligns phrasing toward what the recruiter asked for." },
    { k: "3", title: "Preview + export PDF", detail: "Iterate in seconds instead of fiddling inside Word templates." },
  ];

  return (
    <section className="relative mx-auto mt-24 max-w-6xl overflow-hidden px-4 lg:px-8">
      <div className="absolute inset-x-[-20%] top-[-20%] h-[420px] rounded-[999px] bg-gradient-to-r from-indigo-600/10 via-purple-600/15 to-teal-500/10 blur-3xl" />
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-12%" }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: reduceMotion ? 0 : 0.13 } },
        }}
        className="relative mx-auto mt-16 max-w-4xl rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-xl shadow-purple-600/15 backdrop-blur-xl ring-1 ring-slate-200/75 dark:border-slate-800/70 dark:bg-slate-950/55 dark:ring-white/10"
      >
        <h2 className="text-center font-display text-3xl font-extrabold text-slate-900 dark:text-white">How it works</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Three calm steps—from baseline data to recruiter-ready collateral.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <motion.div
              key={s.k}
              variants={fadeUp}
              transition={{ duration: 0.45 }}
              className="rounded-2xl border border-slate-200/70 bg-white/85 p-5 dark:border-slate-800 dark:bg-slate-950/50"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-lg font-black text-white shadow-lg shadow-indigo-500/30">
                {s.k}
              </span>
              <h3 className="mt-4 font-display font-semibold text-slate-900 dark:text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.detail}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

const testimonials = [
  {
    name: "Asha K.",
    role: "Growth PM • Series B",
    quote: "I ship a tailored variant for every recruiter loop now. It feels unfairly fast.",
    accent: "from-emerald-500/15 to-teal-500/10",
  },
  {
    name: "Leo Martinez",
    role: "Senior SWE • remote-first",
    quote: "Keeps hallucinations in check if you pour real bullets in first. ATS checks pass where it mattered.",
    accent: "from-indigo-500/18 to-purple-600/14",
  },
  {
    name: "Priya N.",
    role: "Product Designer",
    quote: "The UX is tighter than fiddling Google Docs templates midnight before interviews.",
    accent: "from-amber-500/15 to-rose-500/12",
  },
];

function LandingTestimonials() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="mx-auto mt-28 max-w-6xl px-4 lg:px-8">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">What builders say</h2>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Early crews using AI leverage without losing authenticity.
        </p>
      </div>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-10%" }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: reduceMotion ? 0 : 0.12 } },
        }}
        className="grid gap-6 lg:grid-cols-3"
      >
        {testimonials.map((t) => (
          <motion.blockquote
            key={t.name}
            variants={fadeUp}
            transition={{ duration: 0.45 }}
            whileHover={reduceMotion ? undefined : { y: -6 }}
            className={`relative overflow-hidden rounded-[1.85rem] border border-white/50 bg-white/65 p-6 shadow-xl shadow-purple-900/10 backdrop-blur-xl ring-1 ring-slate-200/65 dark:border-slate-800/70 dark:bg-slate-950/55 dark:ring-white/10`}
          >
            <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${t.accent} opacity-95`} />
            <p className="font-display text-sm font-medium leading-relaxed text-slate-900 dark:text-slate-100">“{t.quote}”</p>
            <footer className="mt-5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t.name} · <span className="font-normal text-slate-500 dark:text-slate-400">{t.role}</span>
            </footer>
          </motion.blockquote>
        ))}
      </motion.div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="mx-auto mt-28 max-w-6xl border-t border-slate-200/70 px-4 pb-14 pt-10 dark:border-slate-800 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="font-display text-lg font-bold text-slate-900 dark:text-white">Resume Marker</p>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Craft job-specific resumes with transparent guardrails-first AI. Iterate fast, verify facts, ship PDFs recruiters can skim.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <Link to="/login" className="hover:text-indigo-700 dark:hover:text-indigo-300">
            Log in
          </Link>
          <Link to="/signup" className="hover:text-indigo-700 dark:hover:text-indigo-300">
            Sign up
          </Link>
          <Link to="/app/dashboard" className="hover:text-indigo-700 dark:hover:text-indigo-300">
            Workspace
          </Link>
          <Link to="#" className="opacity-55">
            Privacy
          </Link>
        </div>
      </div>
      <p className="mt-10 text-[11px] text-slate-400 dark:text-slate-600">
        © {new Date().getFullYear()} Resume Marker · Lokeshwar Menati. Designed for pragmatic shipping.
      </p>
    </footer>
  );
}
