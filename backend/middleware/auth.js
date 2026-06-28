const jwt = require("jsonwebtoken");
const { findUserById } = require("../config/db");

// Verifies the JWT sent in the Authorization header and attaches the
// authenticated user to req.user. Used on every protected route.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Missing or malformed Authorization header" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = requireAuth;
