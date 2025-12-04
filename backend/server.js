import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

import {
  sequelize,
  Bangunan,
  Ruangan,
  LantaiGambar,
  RuanganGallery,
  Titik,
  Jalur,
} from "./models/index.js";
import bangunanRoutes from "./routes/bangunan.js";
import ruanganRoutes from "./routes/ruangan.js";
import authRoutes from "./routes/auth.js";
import lantaiGambarRoutes from "./routes/lantaiGambar.js";
import ruanganGalleryRoutes from "./routes/ruanganGallery.js";
import maintenanceRoutes from "./routes/maintenance.js";
import titikRoutes from "./routes/titik.js";
import jalurRoutes from "./routes/jalur.js";

const app = express();

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      "http://localhost:3000", // Default frontend dev URL
      "http://localhost:3001", // Default backend dev URL  
      "http://localhost:3002", // Alternative port
    ];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "ngrok-skip-browser-warning",
    "User-Agent",
    "Origin",
    "Referer",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Remove ngrok headers if present
app.use((req, res, next) => {
  // Remove ngrok headers that might cause CORS issues
  delete req.headers["ngrok-skip-browser-warning"];
  delete req.headers["ngrok-trace-id"];
  next();
});

app.use(express.json());

// API routes
app.use("/api/bangunan", bangunanRoutes);
app.use("/api/ruangan", ruanganRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/lantai-gambar", lantaiGambarRoutes);
app.use("/api/ruangan-gallery", ruanganGalleryRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/titik", titikRoutes);
app.use("/api/jalur", jalurRoutes);

// Debug endpoints
app.get("/api/debug/env", (req, res) => {
  res.json({
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    DB_PASS: process.env.DB_PASS ? "***SET***" : "❌ NOT SET",
    JWT_SECRET: process.env.JWT_SECRET ? "***SET***" : "❌ NOT SET",
    NODE_ENV: process.env.NODE_ENV,
    MYSQL_URL: process.env.MYSQL_URL ? "***SET***" : "❌ NOT SET",
  });
});

app.get("/api/debug/db", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "Database connected",
      message: "Database connection successful",
    });
  } catch (err) {
    res.status(500).json({
      status: "Database disconnected",
      error: err.message,
      code: err.code,
    });
  }
});

// ROUTE "/" MENAMPILKAN DATA DATABASE
app.get("/", async (req, res) => {
  try {
    const daftarBangunan = await Bangunan.findAll();
    const daftarRuangan = await Ruangan.findAll();
    const daftarLantaiGambar = await LantaiGambar.findAll();
    const daftarRuanganGallery = await RuanganGallery.findAll();

    res.json({
      status: "API aktif & koneksi DB OK",
      jumlah_bangunan: daftarBangunan.length,
      jumlah_ruangan: daftarRuangan.length,
      jumlah_lantai_gambar: daftarLantaiGambar.length,
      jumlah_ruangan_gallery: daftarRuanganGallery.length,
      data: {
        bangunan: daftarBangunan,
        ruangan: daftarRuangan,
        lantai_gambar: daftarLantaiGambar,
        ruangan_gallery: daftarRuanganGallery,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "Gagal ambil data database",
      error: err.message,
    });
  }
});

// Database connection with retry logic
const connectDB = async (retries = 5) => {
  console.log("🔍 Database Connection Details:");
  console.log("DB_HOST:", process.env.DB_HOST);
  console.log("DB_PORT:", process.env.DB_PORT);
  console.log("DB_USER:", process.env.DB_USER);
  console.log("DB_NAME:", process.env.DB_NAME);
  console.log("DB_PASS:", process.env.DB_PASS ? "***SET***" : "NOT SET");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("");

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Attempt ${i + 1}/${retries} - Connecting to database...`);
      await sequelize.authenticate();
      console.log("✅ Koneksi DB berhasil");
      await sequelize.sync();
      return true;
    } catch (err) {
      console.error(`❌ Gagal koneksi DB (attempt ${i + 1}/${retries}):`);
      console.error("Error:", err.message);
      console.error("Code:", err.code);
      console.error("Errno:", err.errno);

      // Provide specific troubleshooting tips
      if (err.code === "ECONNREFUSED") {
        console.log(
          "💡 Troubleshooting: Connection refused - Check if database service is running"
        );
      } else if (err.code === "ER_ACCESS_DENIED_ERROR") {
        console.log(
          "💡 Troubleshooting: Access denied - Check DB_USER and DB_PASS"
        );
      } else if (err.code === "ER_BAD_DB_ERROR") {
        console.log(
          "💡 Troubleshooting: Database doesn't exist - Check DB_NAME"
        );
      }

      if (i === retries - 1) {
        console.error("❌ Gagal koneksi DB setelah semua percobaan");
        return false;
      }
      // Wait 5 seconds before retry
      console.log("⏳ Waiting 5 seconds before retry...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

// Start server
const startServer = async () => {
  const PORT = process.env.PORT || 3001;

  // Try to connect to database
  const dbConnected = await connectDB();

  if (!dbConnected) {
    console.log("⚠️ Server akan start tanpa koneksi database");
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server di http://localhost:${PORT}`);
    console.log(
      `📊 Database status: ${dbConnected ? "Connected" : "Disconnected"}`
    );
  });
};

startServer();
