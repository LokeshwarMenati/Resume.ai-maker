const OpenAI = require("openai");

function buildPrompt({ profilePayload, uploadedResumeText, jobDescription }) {
  return [
    "You are an expert resume writer and ATS optimizer.",
    "",
    "Task: Produce a single polished, ATS-friendly resume as plain text only.",
    "Rules:",
    "- Use clear ALL-CAPS section headers on their own lines: SUMMARY, SKILLS, EXPERIENCE, EDUCATION, PROJECTS, CERTIFICATIONS.",
    "- Mirror important keywords naturally from the job description where truthful.",
    "- Use concise bullet-like lines prefixed with '- ' inside sections where appropriate.",
    "- Do not invent employers, degrees, or dates not implied by the data.",
    "- If employment dates are unclear, omit them rather than guessing.",
    "- Prefer strong action verbs and quantified outcomes where the user supplied them.",
    "- No markdown, no commentary, only the resume content.",
    "",
    "JOB DESCRIPTION:",
    jobDescription.trim() || "(none provided)",
    "",
    "STRUCTURED PROFILE (JSON):",
    JSON.stringify(profilePayload, null, 2),
    "",
    "EXISTING UPLOADED RESUME TEXT (may be noisy from PDF):",
    (uploadedResumeText || "").trim().slice(0, 12000) || "(empty)",
    "",
    "OUTPUT: Plain text resume only.",
  ].join("\n");
}

async function generateResume({ profilePayload, uploadedResumeText, jobDescription }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.35,
      max_tokens: 2500,
      messages: [
        {
          role: "user",
          content: buildPrompt({ profilePayload, uploadedResumeText, jobDescription }),
        },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) throw new Error("Empty response from model");
    return text;
  } catch (err) {
    if (err?.status === 401) throw new Error("OpenAI authentication failed — check OPENAI_API_KEY");
    if (err?.response?.status) throw new Error(err.message || "OpenAI API error");
    throw err;
  }
}

module.exports = { generateResume };
