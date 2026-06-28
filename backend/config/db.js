const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/fish_freshness";

  await mongoose.connect(uri);
  console.log(`[db] Connected to MongoDB: ${uri}`);

  await bootstrapAdmin();
}

// Creates a default admin user on first run, if none exists yet.
// This lets the mobile Admin Login screen work immediately without a
// separate signup flow for admins (the project guide treats admin accounts
// as pre-provisioned, not self-registered).
async function bootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@tnovasolutions.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    name: "Admin",
    email,
    password: passwordHash,
    role: "admin",
  });

  console.log(`[db] Created default admin account: ${email} (change the password after first login)`);
}

module.exports = connectDB;
