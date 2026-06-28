const express = require("express");
const requireAuth = require("../middleware/auth");
const { getPredictionsByUser } = require("../config/db");

const router = express.Router();

// GET /history (auth required)
router.get("/", requireAuth, (req, res) => {
  try {
    const predictions = getPredictionsByUser(req.user._id).slice(0, 100);
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history", details: err.message });
  }
});

module.exports = router;
