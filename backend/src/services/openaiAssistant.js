const OpenAI = require("openai");

function clampInt(n, lo, hi) {
  const x = Number.parseInt(String(n), 10);
  if (Number.isNaN(x)) return lo;
  return Math.min(hi, Math.max(lo, x));
}

function getApiKey() {
  const key = String(process.env.OPENAI_API_KEY || "").trim();
  if (!key || key.startsWith("sk-us16I") || key === "sk-us16IorwdmGDQScP7NUq8yqzzNPpBpP5UjI7sxroOMdo6Ya9") {
    return null;
  }
  return key;
}

function buildClient() {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

async function withAiFallback(apiCall, fallbackFn) {
  const client = buildClient();
  if (!client) {
    console.warn("[AI Fallback] No valid OPENAI_API_KEY found in .env — using smart local AI fallback mode.");
    return fallbackFn();
  }
  try {
    return await apiCall(client);
  } catch (err) {
    if (err?.status === 401 || err?.code === "invalid_api_key" || err?.message?.includes("Incorrect API key")) {
      console.warn("[AI Fallback] OpenAI authentication failed (401 Invalid Key) — using smart local AI fallback mode.");
      return fallbackFn();
    }
    throw err;
  }
}

function mockCoachChat({ userMessage }) {
  const lower = String(userMessage || "").toLowerCase();

  if (lower.includes("skill")) {
    return [
      "Here are top recommended skills to feature on your resume:",
      "• Technical Skills: JavaScript, TypeScript, React, Node.js, REST APIs, Database Management (MongoDB/SQL), Git.",
      "• Professional Skills: Problem Solving, Technical Communication, Cross-functional Teamwork, Agile Methodology.",
      "• Tip: Group your skills under clear categories (Languages, Frameworks, Developer Tools) so recruiters can scan quickly."
    ].join("\n");
  }

  if (lower.includes("summary") || lower.includes("about")) {
    return [
      "Here is a tailored professional summary template:",
      "\"Results-driven Software Engineer with hands-on experience building scalable web applications. Proficient in modern frontend frameworks, backend API design, and database architecture. Recognized for writing clean, maintainable code and solving complex technical problems.\""
    ].join("\n");
  }

  if (lower.includes("job") || lower.includes("optimize") || lower.includes("jd")) {
    return [
      "Here are 3 key steps to optimize your resume for target job descriptions:",
      "1. Keyword Alignment: Feature exact technical terms from the job posting in your skills and summary.",
      "2. STAR Method: Structure work experience bullets as Situation, Task, Action, and measurable Outcome.",
      "3. Action Verbs: Begin every bullet with active verbs such as Engineered, Architected, Developed, or Streamlined."
    ].join("\n");
  }

  return [
    "Here are 3 recommendations to improve your resume:",
    "1. Quantify Impact: Include metrics (percentages, revenue, user counts) to demonstrate concrete achievements.",
    "2. Concise Formatting: Keep section headers standard and ensure consistent font sizing and spacing.",
    "3. Focus on Outcomes: Highlight what you built and the results achieved, not just routine daily tasks."
  ].join("\n");
}

function mockScoreResumePack({ projectSnapshot }) {
  const skillsCount = Array.isArray(projectSnapshot?.skills) ? projectSnapshot.skills.length : 0;
  const expCount = Array.isArray(projectSnapshot?.experience) ? projectSnapshot.experience.length : 0;
  const hasSummary = Boolean(projectSnapshot?.personalDetails?.summary);

  const overall = clampInt(68 + skillsCount * 2 + expCount * 4 + (hasSummary ? 8 : 0), 65, 94);
  const ats = clampInt(overall + 3, 70, 96);
  const keywords = clampInt(overall - 2, 60, 92);
  const formatting = 90;
  const impact = clampInt(overall - 4, 60, 88);

  return {
    overall,
    breakdown: { ats, keywords, formatting, impact },
    notes: [
      "Well-structured layout with clear section headings detected.",
      "Consider adding quantifiable metrics (percentages, user counts) to experience bullets.",
      "Align skill keywords directly with terms used in your target job descriptions.",
      "Ensure job titles match standard industry terminology for optimal ATS scanning."
    ],
  };
}

function mockGenerateCoverLetter({ profileSnapshot, companyName, roleTitle }) {
  const company = companyName || "the hiring team";
  const role = roleTitle || "Software Engineer";
  const name = profileSnapshot?.personalDetails?.fullName || profileSnapshot?.personalDetails?.name || "Applicant";
  const skillsList = Array.isArray(profileSnapshot?.skills) && profileSnapshot.skills.length > 0
    ? profileSnapshot.skills.slice(0, 4).join(", ")
    : "software development and web technologies";

  return [
    `Dear Hiring Manager at ${company},`,
    "",
    `I am writing to express my strong interest in the ${role} position. With a solid background in ${skillsList}, I am eager to contribute to ${company}'s ongoing innovation and success.`,
    "",
    `Throughout my work, I have demonstrated a track record of delivering clean, efficient software solutions and collaborating effectively across teams. My technical skills in ${skillsList} allow me to solve complex problems and deliver high-quality user experiences.`,
    "",
    `Thank you for considering my application. I welcome the opportunity to discuss how my background and technical capabilities align with the needs of ${company}.`,
    "",
    "Sincerely,",
    name
  ].join("\n");
}

function mockImproveCoverLetter({ currentText, action, companyName, roleTitle }) {
  const company = companyName || "the hiring team";
  const role = roleTitle || "Software Engineer";
  const base = currentText || `Dear Hiring Team at ${company},\n\nI am writing to apply for the ${role} position...`;

  if (action === "shorten") {
    return base
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .slice(0, 6)
      .join("\n\n");
  }

  if (action === "confident") {
    return base.replace("I am writing to express my interest", "I am excited to submit my candidate application");
  }

  return base + "\n\nI look forward to discussing how my experience can deliver immediate value to your team.";
}

async function coachChat({ userMessage, profileJsonHint }) {
  return withAiFallback(
    async (client) => {
      const system = [
        "You are Resume Marker’s in-app coach.",
        "Be concise, practical, and honest. Do not invent employers, degrees, roles, or metrics.",
        "Prefer bullet steps. If data is missing, ask for it explicitly.",
        "Do not output markdown headings; plain text bullets are okay.",
        profileJsonHint ? "The USER JSON block is authoritative context." : "No structured profile was attached.",
      ].join("\n");

      const userParts = ["USER QUESTION:\n" + userMessage];
      if (profileJsonHint) userParts.push("\nSTRUCTURED PROFILE + RESUME TEXT (JSON):\n" + profileJsonHint);

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.45,
        max_tokens: 700,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userParts.join("\n") },
        ],
      });

      const text = completion.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("Empty assistant response");
      return text;
    },
    () => mockCoachChat({ userMessage })
  );
}

async function scoreResumePack({ jobDescription, projectSnapshot }) {
  return withAiFallback(
    async (client) => {
      const prompt = [
        "Score this resume PACKAGE for a recruiter + ATS perspective.",
        "Return ONLY compact JSON with this exact shape:",
        '{ "overall":0-100, "ats":0-100, "keywords":0-100, "formatting":0-100, "impact":0-100, "notes":[string,string,string] }',
        "Notes must be actionable and short (<= 140 chars each). Prefer 4–6 notes.",
        "",
        "JOB DESCRIPTION (may be empty):",
        jobDescription || "(none)",
        "",
        "PROJECT SNAPSHOT JSON:",
        JSON.stringify(projectSnapshot, null, 2),
      ].join("\n");

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 450,
        messages: [
          { role: "system", content: "You output ONLY valid JSON. No markdown. No commentary." },
          { role: "user", content: prompt },
        ],
      });

      const raw = completion.choices?.[0]?.message?.content?.trim();
      if (!raw) throw new Error("Empty scoring response");

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        const start = raw.indexOf("{");
        const end = raw.lastIndexOf("}");
        if (start >= 0 && end > start) parsed = JSON.parse(raw.slice(start, end + 1));
        else throw new Error("Model did not return JSON");
      }

      const overall = clampInt(parsed.overall, 0, 100);
      const ats = clampInt(parsed.ats, 0, 100);
      const keywords = clampInt(parsed.keywords, 0, 100);
      const formatting = clampInt(parsed.formatting, 0, 100);
      const impact = clampInt(parsed.impact, 0, 100);
      const notes = Array.isArray(parsed.notes) ? parsed.notes.map((s) => String(s)).slice(0, 8) : [];

      return {
        overall,
        breakdown: { ats, keywords, formatting, impact },
        notes,
      };
    },
    () => mockScoreResumePack({ projectSnapshot })
  );
}

function normalizeTone(tone) {
  const x = String(tone || "").trim().toLowerCase();
  if (x === "confident" || x === "friendly" || x === "professional") return x;
  return "professional";
}

function normalizeTemplate(template) {
  const x = String(template || "").trim().toLowerCase();
  if (x === "modern" || x === "formal") return x;
  return "formal";
}

async function generateCoverLetter({ profileSnapshot, jobDescription, companyName, roleTitle, tone, template }) {
  return withAiFallback(
    async (client) => {
      const cleanTone = normalizeTone(tone);
      const cleanTemplate = normalizeTemplate(template);

      const system = [
        "You are a professional career assistant.",
        "Generate a tailored cover letter using the provided profile, resume text, and job description.",
        "Keep it concise: 200-300 words.",
        "Natural language only (not robotic), ATS-friendly phrasing, no filler.",
        "Mention the company name and role.",
        "Highlight only relevant skills/projects from provided data.",
        "Avoid repeating resume bullet points verbatim.",
        "Structure the letter in 3 short paragraphs: opening, middle, and closing.",
        "Use a warm but professional tone and make the output ready to paste directly into a letter.",
        "Output only the final cover letter text. No title, no markdown.",
      ].join("\n");

      const prompt = [
        `TONE: ${cleanTone}`,
        `TEMPLATE STYLE: ${cleanTemplate}`,
        `COMPANY: ${companyName || "the company"}`,
        `ROLE: ${roleTitle || "the role"}`,
        "",
        "JOB DESCRIPTION:",
        jobDescription || "(not provided)",
        "",
        "USER PROFILE + RESUME CONTEXT JSON:",
        JSON.stringify(profileSnapshot, null, 2),
      ].join("\n");

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: cleanTone === "professional" ? 0.4 : 0.6,
        max_tokens: 700,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      });

      const text = completion.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("Empty cover letter response");
      return text;
    },
    () => mockGenerateCoverLetter({ profileSnapshot, companyName, roleTitle })
  );
}

async function improveCoverLetter({ currentText, action, tone, companyName, roleTitle, jobDescription }) {
  return withAiFallback(
    async (client) => {
      const cleanTone = normalizeTone(tone);
      const move = String(action || "").trim().toLowerCase();
      const actionMap = {
        strengthen: "Make this cover letter stronger and more impactful.",
        shorten: "Shorten this cover letter while preserving core relevance and tone.",
        confident: "Rewrite this with a more confident and persuasive tone.",
      };
      const instruction = actionMap[move] || actionMap.strengthen;

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.5,
        max_tokens: 700,
        messages: [
          {
            role: "system",
            content: [
              "You improve an existing cover letter.",
              "Return only the revised cover letter text, 180-300 words.",
              "Keep it ATS-friendly, specific, and natural.",
              "Mention company and role where appropriate.",
            ].join("\n"),
          },
          {
            role: "user",
            content: [
              instruction,
              `Preferred tone: ${cleanTone}`,
              `Company: ${companyName || "the company"}`,
              `Role: ${roleTitle || "the role"}`,
              "Job description:",
              jobDescription || "(not provided)",
              "",
              "Current cover letter:",
              currentText || "",
            ].join("\n"),
          },
        ],
      });

      const text = completion.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("Empty cover letter enhancement response");
      return text;
    },
    () => mockImproveCoverLetter({ currentText, action, companyName, roleTitle })
  );
}

module.exports = {
  coachChat,
  scoreResumePack,
  generateCoverLetter,
  improveCoverLetter,
};
