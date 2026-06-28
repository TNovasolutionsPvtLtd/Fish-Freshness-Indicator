const mongoose = require("mongoose");

// One record per labelled training photo, matching the CSV structure
// described in the project guide:
// filename | species | time_hours | freshness_class | body_part | image_url
const imageSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    species: {
      type: String,
      enum: ["Indian Mackerel", "Oil Sardine"],
      required: true,
    },
    timeHours: { type: Number, required: true }, // 0, 2, 6, 8, 12, 24, 48...
    freshnessClass: {
      type: String,
      enum: ["FRESH", "MEDIUM", "SPOILED"],
      required: true,
    },
    bodyPart: { type: String, enum: ["eye", "gill", "body"], required: true },
    imageUrl: { type: String, required: true }, // local path or Cloudinary URL
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", imageSchema);
