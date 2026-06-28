const express = require("express");
const path = require("path");
const requireAuth = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const upload = require("../utils/upload");
const {
  getImages,
  createImage,
  updateImageStatus,
  countImages,
  countPredictions,
  countUsers,
  countPredictionsSince,
  getUsers,
  getPredictionCountsByUser,
  updateUserFlagged,
} = require("../config/db");

const router = express.Router();

router.use(requireAuth, requireAdmin);

// POST /admin/images - upload a new labelled training image
// multipart/form-data: field "image" + species, timeHours, freshnessClass, bodyPart
router.post("/images", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded (field name must be 'image')" });
    }

    const { species, timeHours, freshnessClass, bodyPart } = req.body;
    if (!species || !timeHours || !freshnessClass || !bodyPart) {
      return res.status(400).json({ error: "species, timeHours, freshnessClass and bodyPart are required" });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${path.basename(req.file.path)}`;

    const image = createImage({
      filename: req.file.filename,
      species,
      timeHours: Number(timeHours),
      freshnessClass,
      bodyPart,
      imageUrl,
      uploadedBy: req.user._id,
    });

    res.status(201).json(image);
  } catch (err) {
    res.status(500).json({ error: "Image upload failed", details: err.message });
  }
});

// GET /admin/images - browse dataset, filter by species/freshness/date
router.get("/images", (req, res) => {
  try {
    const { species, freshnessClass, from, to } = req.query;
    const images = getImages({ species, freshnessClass, from, to }).slice(0, 500);
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch images", details: err.message });
  }
});

// PATCH /admin/images/:id - approve or reject a dataset image
router.patch("/images/:id", (req, res) => {
  try {
    const { status } = req.body; // "approved" | "rejected"
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "status must be approved, rejected or pending" });
    }

    const image = updateImageStatus(req.params.id, status);
    if (!image) return res.status(404).json({ error: "Image not found" });

    res.json(image);
  } catch (err) {
    res.status(500).json({ error: "Failed to update image", details: err.message });
  }
});

// GET /admin/stats - dashboard counts
router.get("/stats", (req, res) => {
  try {
    const imageCount = countImages();
    const predictionCount = countPredictions();
    const userCount = countUsers({ role: "user" });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const predictionsToday = countPredictionsSince(startOfDay);

    res.json({ imageCount, predictionCount, predictionsToday, userCount });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats", details: err.message });
  }
});

// GET /admin/users - list registered users with their prediction counts
router.get("/users", (req, res) => {
  try {
    const users = getUsers({ role: "user" });
    const counts = getPredictionCountsByUser();

    const result = users.map((u) => ({
      ...u,
      predictionCount: counts[u._id] || 0,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
});

// PATCH /admin/users/:id - flag/unflag a suspicious account
router.patch("/users/:id", (req, res) => {
  try {
    const { flagged } = req.body;
    const user = updateUserFlagged(req.params.id, flagged);

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user", details: err.message });
  }
});

module.exports = router;
