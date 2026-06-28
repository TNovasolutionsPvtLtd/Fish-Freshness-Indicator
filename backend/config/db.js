const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DB_PATH = path.join(__dirname, "../data/db.json");
const DEFAULT_DB = { users: [], images: [], predictions: [] };

function ensureDbFile() {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    writeDb(DEFAULT_DB);
  }
}

function readDb() {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return raw ? JSON.parse(raw) : { ...DEFAULT_DB };
  } catch (err) {
    writeDb(DEFAULT_DB);
    return { ...DEFAULT_DB };
  }
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function now() {
  return new Date().toISOString();
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

async function initializeDatabase() {
  ensureDbFile();
  const db = readDb();

  if (!db.users.some((u) => u.role === "admin")) {
    const email = process.env.ADMIN_EMAIL || "admin@tnovasolutions.com";
    const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
    const passwordHash = await bcrypt.hash(password, 10);

    db.users.push({
      _id: generateId(),
      name: "Admin",
      email: email.toLowerCase(),
      password: passwordHash,
      role: "admin",
      flagged: false,
      createdAt: now(),
      updatedAt: now(),
    });

    writeDb(db);
    console.log(`[db] Created default admin account: ${email}`);
  }
}

function findUserByEmail(email) {
  const db = readDb();
  return sanitizeUser(db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()));
}

function findUserByEmailWithPassword(email) {
  const db = readDb();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function findUserById(id) {
  const db = readDb();
  return sanitizeUser(db.users.find((u) => u._id === id));
}

function createUser({ name, email, passwordHash, role = "user" }) {
  const db = readDb();

  const user = {
    _id: generateId(),
    name,
    email: email.toLowerCase(),
    password: passwordHash,
    role,
    flagged: false,
    createdAt: now(),
    updatedAt: now(),
  };

  db.users.push(user);
  writeDb(db);
  return sanitizeUser(user);
}

function updateUserById(id, changes) {
  const db = readDb();
  const user = db.users.find((u) => u._id === id);
  if (!user) return null;

  Object.assign(user, changes, { updatedAt: now() });
  writeDb(db);
  return sanitizeUser(user);
}

function getUsers(filter = {}) {
  const db = readDb();
  return db.users
    .filter((user) => {
      if (filter.role && user.role !== filter.role) return false;
      if (filter.email && user.email !== filter.email.toLowerCase()) return false;
      return true;
    })
    .map(sanitizeUser);
}

function getPredictionCountsByUser() {
  const db = readDb();
  return db.predictions.reduce((acc, prediction) => {
    acc[prediction.user] = (acc[prediction.user] || 0) + 1;
    return acc;
  }, {});
}

function getPredictionsByUser(userId) {
  const db = readDb();
  return db.predictions
    .filter((prediction) => prediction.user === userId)
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

function createPrediction({ user, imageUrl, species, result, confidence, explanation }) {
  const db = readDb();
  const prediction = {
    _id: generateId(),
    user,
    imageUrl,
    species: species || null,
    result,
    confidence,
    explanation,
    createdAt: now(),
    updatedAt: now(),
  };

  db.predictions.push(prediction);
  writeDb(db);
  return prediction;
}

function getImages(filters = {}) {
  const db = readDb();
  return db.images
    .filter((image) => {
      if (filters.species && image.species !== filters.species) return false;
      if (filters.freshnessClass && image.freshnessClass !== filters.freshnessClass) return false;
      if (filters.from || filters.to) {
        const createdAt = new Date(image.createdAt);
        if (filters.from && createdAt < new Date(filters.from)) return false;
        if (filters.to && createdAt > new Date(filters.to)) return false;
      }
      return true;
    })
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

function createImage({ filename, species, timeHours, freshnessClass, bodyPart, imageUrl, uploadedBy }) {
  const db = readDb();
  const image = {
    _id: generateId(),
    filename,
    species,
    timeHours,
    freshnessClass,
    bodyPart,
    imageUrl,
    status: "pending",
    uploadedBy,
    createdAt: now(),
    updatedAt: now(),
  };

  db.images.push(image);
  writeDb(db);
  return image;
}

function updateImageStatus(id, status) {
  const db = readDb();
  const image = db.images.find((item) => item._id === id);
  if (!image) return null;

  image.status = status;
  image.updatedAt = now();
  writeDb(db);
  return image;
}

function countUsers(filter = {}) {
  return getUsers(filter).length;
}

function countImages() {
  const db = readDb();
  return db.images.length;
}

function countPredictions() {
  const db = readDb();
  return db.predictions.length;
}

function countPredictionsSince(date) {
  const db = readDb();
  return db.predictions.filter((prediction) => new Date(prediction.createdAt) >= date).length;
}

function updateUserFlagged(id, flagged) {
  return updateUserById(id, { flagged: !!flagged });
}

module.exports = {
  initializeDatabase,
  findUserByEmail,
  findUserByEmailWithPassword,
  findUserById,
  createUser,
  updateUserById,
  getUsers,
  getPredictionCountsByUser,
  getPredictionsByUser,
  createPrediction,
  getImages,
  createImage,
  updateImageStatus,
  countUsers,
  countImages,
  countPredictions,
  countPredictionsSince,
  updateUserFlagged,
};
