const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServer;

async function connectInMemory() {
  if (!memoryServer) {
    memoryServer = await MongoMemoryServer.create();
  }

  const memoryUri = memoryServer.getUri("resume_builder");
  mongoose.set("strictQuery", true);
  await mongoose.connect(memoryUri, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log("MongoDB connected (in-memory)");
}

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    await connectInMemory();
    return;
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("\n--- MongoDB connection failed ---");
    console.error(err.message || err);
    console.warn("Falling back to in-memory MongoDB for local development.");

    try {
      await connectInMemory();
      return;
    } catch (memoryErr) {
      console.error(memoryErr.message || memoryErr);
    }

    console.error(`
Fix it (pick one):

  • MongoDB Atlas (free): create a cluster, create a DB user,
    whitelist your IP (0.0.0.0/0 while testing),
    paste the SRV URI as MONGO_URI in backend/.env

  • Local MongoDB / Docker:

      docker compose up -d
      (repo root docker-compose.yml, then keep MONGO_URI=mongodb://127.0.0.1:27017/resume_builder)

  • Windows: install MongoDB Community and ensure it listens on 27017,

---`);
    throw err;
  }
}

module.exports = connectDB;
