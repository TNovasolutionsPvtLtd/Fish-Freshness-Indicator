const express = require("express");
const path = require("path");
const requireAuth = require("../middleware/auth");
const upload = require("../utils/upload");
const { predictFreshness } = require("../utils/mlPredict");
const { createPrediction } = require("../config/db");

const router = express.Router();

// POST /predict  (auth required)
// multipart/form-data, field name "image", optional field "species"
router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded (field name must be 'image')" });
    }

    const { result, confidence, explanation, modelType } = await predictFreshness(req.file.path);

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${path.basename(req.file.path)}`;

    const prediction = createPrediction({
      user: req.user._id,
      imageUrl,
      species: req.body.species,
      result,
      confidence,
      explanation,
    });

    res.status(201).json({
      id: prediction._id,
      result,
      confidence,
      explanation,
      imageUrl,
      modelType,
      createdAt: prediction.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Prediction failed", details: err.message });
  }
});

module.exports = router;
