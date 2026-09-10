const serverless = require("serverless-http");
const { app, connectDB } = require("../../../backend/src/server");

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectDB();
  } catch (err) {
    console.error("Database connection error in Netlify function:", err);
  }
  return handler(event, context);
};
