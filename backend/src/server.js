if (process.env.NODE_ENV !== "production") {
  try {
    const path = require("path");
    require("dotenv")?.config?.({ path: path.join(__dirname, "..", ".env") });
  } catch {
    /* dotenv optional in production */
  }
}

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET missing — auth will fail verification");
}
if (!String(process.env.GOOGLE_CLIENT_ID || "").trim()) {
  console.warn("GOOGLE_CLIENT_ID missing — Google sign-in will return 503 until set in backend/.env");
}

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) =>
  res.json({
    ok: true,
    googleConfigured: Boolean(String(process.env.GOOGLE_CLIENT_ID || "").trim()),
    jwtConfigured: Boolean(String(process.env.JWT_SECRET || "").trim()),
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/upload-resume", uploadRoutes);
app.use("/api", resumeRoutes);
app.use("/api", aiRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (res.headersSent) return;
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
  } catch (e) {
    console.error("Failed to start server", e);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

if (require.main === module) {
  start();
}

module.exports = { app, connectDB };
