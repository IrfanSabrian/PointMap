import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import Bangunan from "./models/Bangunan.js";
import Lantai from "./models/Lantai.js";
import Ruangan from "./models/Ruangan.js";
import Jurusan from "./models/Jurusan.js";
import Prodi from "./models/Prodi.js";
import bangunanRoutes from "./routes/bangunan.js";
import lantaiRoutes from "./routes/lantai.js";
import ruanganRoutes from "./routes/ruangan.js";
import jurusanRoutes from "./routes/jurusan.js";
import prodiRoutes from "./routes/prodi.js";
import authRoutes from "./routes/auth.js";

await sequelize.sync(); // pastikan tabel otomatis dibuat (jika belum ada)
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/bangunan", bangunanRoutes);
app.use("/api/lantai", lantaiRoutes);
app.use("/api/ruangan", ruanganRoutes);
app.use("/api/jurusan", jurusanRoutes);
app.use("/api/prodi", prodiRoutes);
app.use("/api/auth", authRoutes);

// ROUTE "/" MENAMPILKAN DATA DATABASE
app.get("/", async (req, res) => {
  try {
    const daftarBangunan = await Bangunan.findAll();
    const daftarLantai = await Lantai.findAll();
    const daftarRuangan = await Ruangan.findAll();
    const daftarJurusan = await Jurusan.findAll();
    const daftarProdi = await Prodi.findAll();

    res.json({
      status: "API aktif & koneksi DB OK",
      jumlah_bangunan: daftarBangunan.length,
      jumlah_lantai: daftarLantai.length,
      jumlah_ruangan: daftarRuangan.length,
      jumlah_jurusan: daftarJurusan.length,
      jumlah_prodi: daftarProdi.length,
      data: {
        bangunan: daftarBangunan,
        lantai: daftarLantai,
        ruangan: daftarRuangan,
        jurusan: daftarJurusan,
        prodi: daftarProdi,
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
