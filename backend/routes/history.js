const express = require("express");
const requireAuth = require("../middleware/auth");
const Prediction = require("../models/Prediction");

const router = express.Router();

// GET /history (auth required)
router.get("/", requireAuth, async (req, res) => {
  try {
    const predictions = await Prediction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history", details: err.message });
  }
});

module.exports = router;
