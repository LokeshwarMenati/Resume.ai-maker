const OpenAI = require("openai");

function clampInt(n, lo, hi) {
  const x = Number.parseInt(String(n), 10);
  if (Number.isNaN(x)) return lo;
  return Math.min(hi, Math.max(lo, x));
}

function buildClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

async function coachChat({ userMessage, profileJsonHint }) {
  const client = buildClient();

  const system = [
    "You are Resume Marker’s in-app coach.",
    "Be concise, practical, and honest. Do not invent employers, degrees, roles, or metrics.",
    "Prefer bullet steps. If data is missing, ask for it explicitly.",
    "Do not output markdown headings; plain text bullets are okay.",
    profileJsonHint
      ? "The USER JSON block is authoritative context."
      : "No structured profile was attached.",
  ].join("\n");

  const userParts = [];
  userParts.push("USER QUESTION:\n" + userMessage);
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
}

async function scoreResumePack({ jobDescription, projectSnapshot }) {
  const client = buildClient();

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
      {
        role: "system",
        content: "You output ONLY valid JSON. No markdown. No commentary.",
      },
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

async function generateCoverLetter({
  profileSnapshot,
  jobDescription,
  companyName,
  roleTitle,
  tone,
  template,
}) {
  const client = buildClient();
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
}

async function improveCoverLetter({
  currentText,
  action,
  tone,
  companyName,
  roleTitle,
  jobDescription,
}) {
  const client = buildClient();
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
}

module.exports = {
  coachChat,
  scoreResumePack,
  generateCoverLetter,
  improveCoverLetter,
};
