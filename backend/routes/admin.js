const express = require("express");
const path = require("path");
const requireAuth = require("../middleware/auth");
const requireAdmin = require("../middleware/admin");
const upload = require("../utils/upload");
const Image = require("../models/Image");
const Prediction = require("../models/Prediction");
const User = require("../models/User");

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

    const image = await Image.create({
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
router.get("/images", async (req, res) => {
  try {
    const { species, freshnessClass, from, to } = req.query;
    const filter = {};
    if (species) filter.species = species;
    if (freshnessClass) filter.freshnessClass = freshnessClass;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const images = await Image.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch images", details: err.message });
  }
});

// PATCH /admin/images/:id - approve or reject a dataset image
router.patch("/images/:id", async (req, res) => {
  try {
    const { status } = req.body; // "approved" | "rejected"
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "status must be approved, rejected or pending" });
    }

    const image = await Image.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!image) return res.status(404).json({ error: "Image not found" });

    res.json(image);
  } catch (err) {
    res.status(500).json({ error: "Failed to update image", details: err.message });
  }
});

// GET /admin/stats - dashboard counts
router.get("/stats", async (req, res) => {
  try {
    const [imageCount, predictionCount, userCount] = await Promise.all([
      Image.countDocuments(),
      Prediction.countDocuments(),
      User.countDocuments({ role: "user" }),
    ]);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const predictionsToday = await Prediction.countDocuments({ createdAt: { $gte: startOfDay } });

    res.json({ imageCount, predictionCount, predictionsToday, userCount });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats", details: err.message });
  }
});

// GET /admin/users - list registered users with their prediction counts
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });

    const counts = await Prediction.aggregate([
      { $group: { _id: "$user", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

    const result = users.map((u) => ({
      ...u.toObject(),
      predictionCount: countMap[String(u._id)] || 0,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
});

// PATCH /admin/users/:id - flag/unflag a suspicious account
router.patch("/users/:id", async (req, res) => {
  try {
    const { flagged } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { flagged: !!flagged },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user", details: err.message });
  }
});

module.exports = router;
