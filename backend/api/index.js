const { app, connectDB } = require("../src/server");

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("DB Connection error in serverless handler:", err);
  }
  return app(req, res);
};
