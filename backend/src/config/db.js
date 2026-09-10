const mongoose = require("mongoose");

let memoryServer;

async function connectInMemory() {
  try {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create();
    }
    const memoryUri = memoryServer.getUri("resume_builder");
    mongoose.set("strictQuery", true);
    await mongoose.connect(memoryUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected (in-memory)");
  } catch (memErr) {
    console.warn("[DB] In-memory Mongo Server unavailable in current environment:", memErr.message);
  }
}

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    await connectInMemory();
    return;
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message || err);
    console.warn("Attempting fallback to in-memory database.");
    await connectInMemory();
  }
}

module.exports = connectDB;
