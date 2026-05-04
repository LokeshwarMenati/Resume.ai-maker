/**
 * Validates MONGO_URI and tries to connect once. Run: npm run check-db
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");

(async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MISSING MONGO_URI — copy backend/.env.example → backend/.env and set MongoDB Atlas or local URI.\n");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    const label = uri.includes("mongodb+srv")
      ? "Atlas (SRV)"
      : uri.replace(/mongodb:\/\/[^:]+:[^@]+@/, "mongodb://***:***@");
    console.log("OK — MongoDB is reachable:", label);
    process.exit(0);
  } catch (e) {
    console.error("FAIL — Cannot connect:", e.message);
    console.error("\nTry MongoDB Atlas (free), docker compose in repo root, or local Mongo — see README.md\n");
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(() => null);
  }
})();
