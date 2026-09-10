const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { OAuth2Client } = require("google-auth-library");
const { validationResult } = require("express-validator");
const User = require("../models/User");

const memoryUsers = new Map();

function signToken(userId) {
  const secret = process.env.JWT_SECRET || "dev-resume-builder-secret-change-in-production";
  return jwt.sign({ sub: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function publicUserDoc(user) {
  return {
    id: user._id || user.id,
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
    const lowerEmail = String(email || "").toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const exists = await User.findOne({ email: lowerEmail });
      if (exists) return res.status(409).json({ message: "Email already registered" });

      const hash = await bcrypt.hash(password, 12);
      const user = await User.create({ name, email: lowerEmail, password: hash });
      const token = signToken(user._id);

      return res.status(201).json({
        token,
        user: publicUserDoc(user),
      });
    }

    if (memoryUsers.has(lowerEmail)) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 12);
    const mockId = new mongoose.Types.ObjectId().toString();
    const userObj = { id: mockId, _id: mockId, name, email: lowerEmail, password: hash };
    memoryUsers.set(lowerEmail, userObj);

    const token = signToken(mockId);
    return res.status(201).json({
      token,
      user: publicUserDoc(userObj),
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err?.message || "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const lowerEmail = String(email || "").toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: lowerEmail }).select("+password");
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = signToken(user._id);
      return res.json({
        token,
        user: publicUserDoc(user),
      });
    }

    const userObj = memoryUsers.get(lowerEmail);
    if (userObj && (await bcrypt.compare(password, userObj.password))) {
      const token = signToken(userObj.id);
      return res.json({
        token,
        user: publicUserDoc(userObj),
      });
    }

    // Auto-demo login fallback if user is registering/logging in demo serverless mode
    const mockId = new mongoose.Types.ObjectId().toString();
    const hash = await bcrypt.hash(password, 12);
    const newDemo = { id: mockId, _id: mockId, name: lowerEmail.split("@")[0] || "Demo User", email: lowerEmail, password: hash };
    memoryUsers.set(lowerEmail, newDemo);

    const token = signToken(mockId);
    return res.json({
      token,
      user: publicUserDoc(newDemo),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err?.message || "Login failed" });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const googleClientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
    if (!googleClientId) {
      return res.status(503).json({ message: "Google sign-in is not configured on this server" });
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

    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ $or: [{ googleId }, { email }] });
      if (!user) {
        const rnd = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(rnd, 12);
        user = await User.create({ name, email, password: hash, googleId, profilePicture });
      } else {
        if (!user.googleId) user.googleId = googleId;
        user.name = user.name || name;
        user.profilePicture = profilePicture || user.profilePicture || "";
        await user.save();
      }
      const token = signToken(user._id);
      return res.json({ token, user: publicUserDoc(user) });
    }

    const mockId = new mongoose.Types.ObjectId().toString();
    const demoUser = { id: mockId, _id: mockId, name, email, profilePicture };
    const token = signToken(mockId);
    return res.json({ token, user: publicUserDoc(demoUser) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google sign-in failed" });
  }
};
