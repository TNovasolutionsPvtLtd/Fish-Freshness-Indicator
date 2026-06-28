// Run this after requireAuth. Blocks anyone whose role isn't "admin",
// matching the guide's role-based access requirement for the Admin flow.
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

module.exports = requireAdmin;
