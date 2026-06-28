const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, required: true },
    species: { type: String }, // optional, user-selected
    result: { type: String, enum: ["FRESH", "MEDIUM", "SPOILED"], required: true },
    confidence: { type: Number, required: true }, // 0-100
    explanation: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prediction", predictionSchema);
