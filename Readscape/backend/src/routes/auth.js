const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[A-Za-z0-9_.-]{3,30}$/;

function publicUser(row) {
  return { id: row.id, name: row.name, username: row.username, email: row.email };
}

function signToken(user) {
  return jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/register  { name, username, email, password }
router.post("/register", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "").trim();
    const password = String(req.body.password || "");

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }
    if (name.length > 100) return res.status(400).json({ message: "Name is too long." });
    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({
        message: "Username must be 3-30 characters: letters, numbers, dots, dashes or underscores.",
      });
    }
    if (!EMAIL_RE.test(email) || email.length > 255) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }
    if (password.length > 17) {
      return res.status(400).json({ message: "Password must be 17 characters or fewer." });
    }

    const dup = await pool.query(
      "SELECT LOWER(email) = LOWER($1) AS email_taken FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2) LIMIT 1",
      [email, username]
    );
    if (dup.rows.length) {
      return res.status(409).json({
        message: dup.rows[0].email_taken
          ? "An account with that email already exists."
          : "That username is already taken.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (name, username, email, password_hash)
       VALUES ($1, $2, $3, $4) RETURNING id, name, username, email`,
      [name, username, email, passwordHash]
    );

    const user = rows[0];
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    // Two people signing up at the same instant can slip past the check above;
    // the unique indexes catch that case.
    if (err.code === "23505") {
      return res.status(409).json({ message: "That email or username is already taken." });
    }
    next(err);
  }
});

// POST /api/auth/login  { email, password }   (email field also accepts a username)
router.post("/login", async (req, res, next) => {
  try {
    const identifier = String(req.body.email || req.body.username || "").trim();
    const password = String(req.body.password || "");

    if (!identifier || !password) {
      return res.status(400).json({ message: "Please enter your email and password." });
    }

    const { rows } = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1) LIMIT 1",
      [identifier]
    );
    const row = rows[0];

    // Same message for "no such user" and "wrong password" so accounts can't be probed.
    const ok = row && (await bcrypt.compare(password, row.password_hash));
    if (!ok) return res.status(401).json({ message: "Incorrect email or password." });

    res.json({ token: signToken(row), user: publicUser(row) });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me  -> the logged-in user (used by the dashboard)
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, username, email FROM users WHERE id = $1",
      [req.user.id]
    );
    if (!rows.length) return res.status(401).json({ message: "Account no longer exists." });
    res.json({ user: publicUser(rows[0]) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
