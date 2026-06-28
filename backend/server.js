require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const { initializeDatabase } = require("./config/db");

const authRoutes = require("./routes/auth");
const predictRoutes = require("./routes/predict");
const historyRoutes = require("./routes/history");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "fish-freshness-backend" });
});

app.use("/auth", authRoutes);
app.use("/predict", predictRoutes);
app.use("/history", historyRoutes);
app.use("/admin", adminRoutes);

// Fallback error handler (e.g. multer file-type errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`[server] Listening on port http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("[server] Failed to initialize database:", err.message);
    process.exit(1);
  });
