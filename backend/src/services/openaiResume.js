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

function mockGenerateResume({ profilePayload, uploadedResumeText }) {
  const name = profilePayload?.personalDetails?.fullName || profilePayload?.personalDetails?.name || "Candidate Name";
  const email = profilePayload?.personalDetails?.email || "candidate@example.com";
  const phone = profilePayload?.personalDetails?.phone || "(555) 000-0000";
  const location = profilePayload?.personalDetails?.location || "City, State";
  const summary = profilePayload?.personalDetails?.summary || "Results-driven professional with extensive expertise in software development and technology solutions.";

  const skillsList = Array.isArray(profilePayload?.skills) && profilePayload.skills.length > 0
    ? profilePayload.skills.join(", ")
    : "JavaScript, TypeScript, React, Node.js, REST APIs, HTML/CSS, Git, SQL";

  const expBullets = Array.isArray(profilePayload?.experience) && profilePayload.experience.length > 0
    ? profilePayload.experience.map(e => `EXPERIENCE: ${e.title || 'Role'} - ${e.company || 'Company'}\n- ${e.description || 'Developed scalable applications and improved performance.'}`).join("\n\n")
    : "EXPERIENCE\n- Software Engineer | Tech Solutions\n- Developed and maintained responsive web applications using modern JavaScript frameworks.\n- Collaborated with cross-functional teams to deliver feature enhancements on schedule.";

  return [
    name.toUpperCase(),
    `${email} | ${phone} | ${location}`,
    "",
    "SUMMARY",
    summary,
    "",
    "SKILLS",
    skillsList,
    "",
    expBullets,
    "",
    uploadedResumeText ? `ADDITIONAL CONTEXT FROM IMPORTED RESUME:\n${uploadedResumeText.slice(0, 500)}` : ""
  ].filter(Boolean).join("\n\n");
}

async function generateResume({ profilePayload, uploadedResumeText, jobDescription }) {
  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  const isValidKey = apiKey && !apiKey.startsWith("sk-us16I") && apiKey !== "sk-us16IorwdmGDQScP7NUq8yqzzNPpBpP5UjI7sxroOMdo6Ya9";

  if (!isValidKey) {
    console.warn("[AI Fallback] No valid OPENAI_API_KEY — generating local mock resume.");
    return mockGenerateResume({ profilePayload, uploadedResumeText });
  }

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
    if (err?.status === 401 || err?.code === "invalid_api_key" || err?.message?.includes("Incorrect API key")) {
      console.warn("[AI Fallback] OpenAI 401 Authentication Error — using local mock resume generator.");
      return mockGenerateResume({ profilePayload, uploadedResumeText });
    }
    throw err;
  }
}

module.exports = { generateResume };
