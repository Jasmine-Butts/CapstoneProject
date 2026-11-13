const jwt = require("jsonwebtoken");

// Protects a route: requires "Authorization: Bearer <token>".
// On success, sets req.user = { id, email }.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Please log in to continue." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: Number(payload.sub), email: payload.email };
    next();
  } catch {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
}

module.exports = requireAuth;
