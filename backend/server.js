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
} from "./models/index.js";
import bangunanRoutes from "./routes/bangunan.js";
import ruanganRoutes from "./routes/ruangan.js";
import authRoutes from "./routes/auth.js";
import lantaiGambarRoutes from "./routes/lantaiGambar.js";
import ruanganGalleryRoutes from "./routes/ruanganGallery.js";
import maintenanceRoutes from "./routes/maintenance.js";

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "https://pointmap.vercel.app",
    "https://pointmap-production.up.railway.app",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

// API routes
app.use("/api/bangunan", bangunanRoutes);
app.use("/api/ruangan", ruanganRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/lantai-gambar", lantaiGambarRoutes);
app.use("/api/ruangan-gallery", ruanganGalleryRoutes);
app.use("/api/maintenance", maintenanceRoutes);

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
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log("✅ Koneksi DB berhasil");
      await sequelize.sync();
      return true;
    } catch (err) {
      console.error(
        `❌ Gagal koneksi DB (attempt ${i + 1}/${retries}):`,
        err.message
      );
      if (i === retries - 1) {
        console.error("❌ Gagal koneksi DB setelah semua percobaan");
        return false;
      }
      // Wait 5 seconds before retry
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
