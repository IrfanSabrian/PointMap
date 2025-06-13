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

app.get("/", (req, res) => res.send("API aktif!"));

try {
  await sequelize.authenticate();
  console.log("✅ Koneksi DB berhasil");
  await sequelize.sync();
} catch (err) {
  console.error("❌ Gagal koneksi DB:", err);
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server di http://localhost:${PORT}`));
