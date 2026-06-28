const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // bcrypt hash, never store plain text
    role: { type: String, enum: ["user", "admin"], default: "user" },
    flagged: { type: Boolean, default: false }, // for admin "flag suspicious accounts"
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
