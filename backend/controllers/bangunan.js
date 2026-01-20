import Bangunan from "../models/Bangunan.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET semua bangunan (with optional campus filter)
export const getAllBangunan = async (req, res) => {
  try {
    const { kampus } = req.query;

    // Build query options
    const queryOptions = {};
    if (kampus) {
      queryOptions.where = { kategori_kampus: kampus };
    }

    const data = await Bangunan.findAll(queryOptions);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET bangunan berdasarkan ID
export const getBangunanById = async (req, res) => {
  try {
    const id = req.params.id;
    const bangunan = await Bangunan.findByPk(id);
    if (!bangunan) {
      return res.status(404).json({ error: "Bangunan tidak ditemukan" });
    }
    res.json(bangunan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE bangunan baru
export const createBangunan = async (req, res) => {
  try {
    const { nama, interaksi, lantai, geometri, kategori_kampus } = req.body;

    // Validasi data wajib
    if (!nama || !geometri) {
      return res.status(400).json({
        error: "Nama bangunan dan data geometri wajib diisi",
      });
    }

    const newBangunan = await Bangunan.create({
      nama,
      interaksi: interaksi || "Noninteraktif",
      lantai: lantai || 1,
      geometri:
        typeof geometri === "string" ? geometri : JSON.stringify(geometri),
      kategori_kampus: kategori_kampus || "Politeknik Negeri Pontianak",
    });

    res.status(201).json({
      message: "Bangunan berhasil dibuat",
      data: newBangunan,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE bangunan
export const updateBangunan = async (req, res) => {
  try {
    const id = req.params.id;
    const { nama, interaksi, lantai, thumbnail, geometri, kategori_kampus } =
      req.body;

    console.log("🏗️ UPDATE BANGUNAN REQUEST:");
    console.log("  - ID:", id);
    console.log("  - Body Keys:", Object.keys(req.body));
    console.log("  - nama:", nama);
    console.log("  - interaksi:", interaksi);
    console.log("  - lantai:", lantai);
    console.log("  - kategori_kampus:", kategori_kampus);
    console.log("  - geometri present:", !!geometri);
    console.log("  - thumbnail present:", !!thumbnail);

    // Check if building exists first
    const existingBangunan = await Bangunan.findByPk(id);
    console.log("  - Building exists:", !!existingBangunan);
    if (!existingBangunan) {
      console.log("❌ Building not found in database with ID:", id);
      return res.status(404).json({ error: "Bangunan tidak ditemukan" });
    }

    // Hanya update field yang dikirim (tidak undefined)
    const updateData = {};
    if (nama !== undefined) updateData.nama = nama;
    if (interaksi !== undefined) updateData.interaksi = interaksi;
    if (lantai !== undefined) updateData.lantai = lantai;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (kategori_kampus !== undefined)
      updateData.kategori_kampus = kategori_kampus;
    if (geometri !== undefined) {
      updateData.geometri =
        typeof geometri === "string" ? geometri : JSON.stringify(geometri);
    }

    console.log("  - Update fields:", Object.keys(updateData));

    // If there are no fields to update, just return the existing building
    if (Object.keys(updateData).length === 0) {
      console.log("⚠️ No fields to update, returning existing building");
      return res.json({
        message: "Bangunan berhasil diperbarui",
        data: existingBangunan,
      });
    }

    const [updated] = await Bangunan.update(updateData, {
      where: { id_bangunan: id },
    });

    console.log("  - Rows updated:", updated);

    // Get the updated building regardless of whether rows were affected
    // (Sequelize returns 0 if values are the same, but we still want to return success)
    const updatedBangunan = await Bangunan.findByPk(id);

    console.log("✅ Building update completed:", id);
    res.json({
      message: "Bangunan berhasil diperbarui",
      data: updatedBangunan,
    });
  } catch (err) {
    console.error("❌ Error updating building:", err);
    res.status(500).json({ error: err.message });
  }
};

// UPLOAD THUMBNAIL BANGUNAN
export const uploadThumbnail = async (req, res) => {
  try {
    const id = req.params.id;

    // Cek apakah bangunan ada
    const bangunan = await Bangunan.findByPk(id);
    if (!bangunan) {
      return res.status(404).json({ error: "Bangunan tidak ditemukan" });
    }

    // Cek apakah ada file yang diupload
    if (!req.file) {
      return res.status(400).json({ error: "Tidak ada file yang diupload" });
    }

    // Validasi tipe file (gambar umum)
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(req.file.mimetype)) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        error: "Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP",
      });
    }

    // Path untuk menyimpan file di frontend/public/img/{id_bangunan}/
    const uploadDir = path.join(
      __dirname,
      "../../frontend/public/img",
      id.toString(),
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate filename
    const fileExt = path.extname(req.file.originalname);
    const fileName = `thumbnail${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    // Hapus thumbnail lama jika ada
    if (bangunan.thumbnail && !bangunan.thumbnail.startsWith("http")) {
      const oldFilePath = path.join(
        __dirname,
        "../../frontend/public",
        bangunan.thumbnail.replace(/^\//, ""),
      );
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Move uploaded file to final location
    fs.copyFileSync(req.file.path, filePath);
    fs.unlinkSync(req.file.path); // Delete temp file

    // Path untuk database (relative path untuk frontend)
    const dbPath = `/img/${id}/${fileName}`;

    // Simpan path ke database
    await Bangunan.update(
      { thumbnail: dbPath },
      { where: { id_bangunan: id } },
    );

    // Ambil data bangunan yang sudah diupdate
    const updatedBangunan = await Bangunan.findByPk(id);

    res.json({
      message: "Thumbnail berhasil diupload",
      data: updatedBangunan,
      thumbnailPath: dbPath,
    });
  } catch (err) {
    // Bersihkan file sementara jika ada
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    res.status(500).json({ error: err.message });
  }
};

// DELETE bangunan
export const deleteBangunan = async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await Bangunan.destroy({
      where: { id_bangunan: id },
    });

    if (deleted) {
      res.json({
        message: "Bangunan berhasil dihapus",
      });
    } else {
      res.status(404).json({ error: "Bangunan tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBangunanGeoJSON = async (req, res) => {
  try {
    const { kampus } = req.query;

    // Build query options
    const queryOptions = {};
    if (kampus) {
      queryOptions.where = { kategori_kampus: kampus };
    }

    const bangunan = await Bangunan.findAll(queryOptions);
    const features = bangunan.map((b) => ({
      type: "Feature",
      geometry: JSON.parse(b.geometri),
      properties: {
        id: b.id_bangunan,
        nama: b.nama,
        interaksi: b.interaksi,
        lantai: b.lantai,
        thumbnail: b.thumbnail,
        kategori_kampus: b.kategori_kampus,
      },
    }));
    res.json({
      type: "FeatureCollection",
      features,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
