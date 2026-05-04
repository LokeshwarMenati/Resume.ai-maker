const jwt = require("jsonwebtoken");

const User = require("../models/User");



function extractToken(req) {

  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) return null;

  return auth.slice(7);

}



async function requireAuth(req, res, next) {

  try {

    const token = extractToken(req);

    if (!token) return res.status(401).json({ message: "Authentication required" });



    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.sub).select("name email profilePicture");

    if (!user) return res.status(401).json({ message: "User not found" });



    req.user = {

      id: user._id.toString(),

      name: user.name,

      email: user.email,

      profilePicture: user.profilePicture || "",

    };

    next();

  } catch (err) {

    const status = err.name === "JsonWebTokenError" || err.name === "TokenExpiredError" ? 401 : 500;

    return res.status(status).json({ message: status === 401 ? "Invalid or expired token" : "Auth error" });

  }

}



module.exports = { requireAuth, extractToken };

