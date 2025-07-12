import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

import {
  sequelize,
  Bangunan,
  Ruangan,
  Jurusan,
  Prodi,
} from "./models/index.js";
import bangunanRoutes from "./routes/bangunan.js";
import ruanganRoutes from "./routes/ruangan.js";
import jurusanRoutes from "./routes/jurusan.js";
import prodiRoutes from "./routes/prodi.js";
import authRoutes from "./routes/auth.js";

await sequelize.sync(); // pastikan tabel otomatis dibuat (jika belum ada)

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/bangunan", bangunanRoutes);
app.use("/api/ruangan", ruanganRoutes);
app.use("/api/jurusan", jurusanRoutes);
app.use("/api/prodi", prodiRoutes);
app.use("/api/auth", authRoutes);

// ROUTE "/" MENAMPILKAN DATA DATABASE
app.get("/", async (req, res) => {
  try {
    const daftarBangunan = await Bangunan.findAll();
    const daftarRuangan = await Ruangan.findAll();
    const daftarJurusan = await Jurusan.findAll();
    const daftarProdi = await Prodi.findAll();

    res.json({
      status: "API aktif & koneksi DB OK",
      jumlah_bangunan: daftarBangunan.length,
      jumlah_ruangan: daftarRuangan.length,
      jumlah_jurusan: daftarJurusan.length,
      jumlah_prodi: daftarProdi.length,
      data: {
        bangunan: daftarBangunan,
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
