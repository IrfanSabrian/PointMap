import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import Gedung from "./models/Gedung.js";
import Lantai from "./models/Lantai.js";
import Ruangan from "./models/Ruangan.js";
import gedungRoutes from "./routes/gedung.js";
import lantaiRoutes from "./routes/lantai.js";
import ruanganRoutes from "./routes/ruangan.js";
import authRoutes from "./routes/auth.js";

await sequelize.sync(); // pastikan tabel otomatis dibuat (jika belum ada)
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/gedung", gedungRoutes);
app.use("/api/lantai", lantaiRoutes);
app.use("/api/ruangan", ruanganRoutes);
app.use("/api/auth", authRoutes);

// ROUTE "/" MENAMPILKAN DATA DATABASE
app.get("/", async (req, res) => {
  try {
    const daftarGedung = await Gedung.findAll();
    const daftarLantai = await Lantai.findAll();
    const daftarRuangan = await Ruangan.findAll();

    res.json({
      status: "API aktif & koneksi DB OK",
      jumlah_gedung: daftarGedung.length,
      jumlah_lantai: daftarLantai.length,
      jumlah_ruangan: daftarRuangan.length,
      data: {
        gedung: daftarGedung,
        lantai: daftarLantai,
        ruangan: daftarRuangan,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "Gagal ambil data database",
      error: err.message,
    });
  }
});

try {
  await sequelize.authenticate();
  console.log("✅ Koneksi DB berhasil");
  await sequelize.sync();
} catch (err) {
  console.error("❌ Gagal koneksi DB:", err);
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server di http://localhost:${PORT}`));
