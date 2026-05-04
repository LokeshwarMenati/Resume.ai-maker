const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { validationResult } = require("express-validator");
const User = require("../models/User");

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function publicUserDoc(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture || "",
  };
}

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hash });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: publicUserDoc(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: publicUserDoc(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const googleClientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
    if (!googleClientId) {
      return res.status(503).json({ message: "Google sign-in is not configured on this server" });
    }

    if (!String(process.env.JWT_SECRET || "").trim()) {
      return res.status(503).json({ message: "Server JWT_SECRET is not set — cannot issue session token" });
    }

    const idToken = String(req.body.credential || req.body.token || "").trim();
    if (!idToken) {
      return res.status(400).json({
        message: "Google JWT required — send JSON { credential } (from @react-oauth/google) or { token }",
      });
    }

    const client = new OAuth2Client(googleClientId);
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.warn("[auth/google] verifyIdToken failed:", verifyErr?.message || verifyErr);
      const origin =
        typeof req.headers.origin === "string" && req.headers.origin
          ? req.headers.origin
          : "http://localhost:5173";
      const detail =
        process.env.NODE_ENV !== "production" && verifyErr?.message
          ? ` Details: ${verifyErr.message}`
          : "";
      return res.status(401).json({
        message: `Invalid Google token. Use one OAuth Web client ID everywhere; in Google Cloud add Authorized JavaScript origins for your exact URL (e.g. ${origin} and, if you use it, http://127.0.0.1:5173).${detail}`,
      });
    }

    const googleId = payload.sub;
    const email = (payload.email || "").toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: "Google account has no verified email" });
    }

    const name = payload.name?.trim() || email.split("@")[0];
    const profilePicture = payload.picture?.trim() || "";

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      const rnd = crypto.randomBytes(32).toString("hex");
      const hash = await bcrypt.hash(rnd, 12);
      user = await User.create({
        name,
        email,
        password: hash,
        googleId,
        profilePicture,
      });
    } else {
      if (!user.googleId) user.googleId = googleId;
      user.name = user.name || name;
      user.profilePicture = profilePicture || user.profilePicture || "";
      await user.save();
    }

    const token = signToken(user._id);

    const fresh = await User.findById(user._id);
    res.json({
      token,
      user: publicUserDoc(fresh),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google sign-in failed" });
  }
};
