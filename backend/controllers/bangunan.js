import Bangunan from "../models/Bangunan.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET semua bangunan
export const getAllBangunan = async (req, res) => {
  try {
    const data = await Bangunan.findAll();
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
    const { nama, interaksi, lantai, geometri } = req.body;

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
    const { nama, interaksi, lantai, thumbnail, geometri } = req.body;

    // Hanya update field yang dikirim (tidak undefined)
    const updateData = {};
    if (nama !== undefined) updateData.nama = nama;
    if (interaksi !== undefined) updateData.interaksi = interaksi;
    if (lantai !== undefined) updateData.lantai = lantai;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (geometri !== undefined) {
      updateData.geometri =
        typeof geometri === "string" ? geometri : JSON.stringify(geometri);
    }

    const [updated] = await Bangunan.update(updateData, {
      where: { id_bangunan: id },
    });
    if (updated) {
      const updatedBangunan = await Bangunan.findByPk(id);
      res.json({
        message: "Bangunan berhasil diperbarui",
        data: updatedBangunan,
      });
    } else {
      res.status(404).json({ error: "Bangunan tidak ditemukan" });
    }
  } catch (err) {
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

    // Path untuk menyimpan file
    const uploadDir = path.join(__dirname, "../uploads/thumbnails");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate filename
    const fileExt = path.extname(req.file.originalname);
    const fileName = `bangunan_${id}_thumbnail${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    // Hapus thumbnail lama jika ada
    if (bangunan.thumbnail && !bangunan.thumbnail.startsWith("http")) {
      const oldFilePath = path.join(__dirname, "..", bangunan.thumbnail);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Move uploaded file to final location
    fs.copyFileSync(req.file.path, filePath);
    fs.unlinkSync(req.file.path); // Delete temp file

    // Path untuk database (relative path untuk serving via express.static)
    const dbPath = `uploads/thumbnails/${fileName}`;

    // Simpan path ke database
    await Bangunan.update(
      { thumbnail: dbPath },
      { where: { id_bangunan: id } }
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
    const bangunan = await Bangunan.findAll();
    const features = bangunan.map((b) => ({
      type: "Feature",
      geometry: JSON.parse(b.geometri),
      properties: {
        id: b.id_bangunan,
        nama: b.nama,
        interaksi: b.interaksi,
        lantai: b.lantai,
        thumbnail: b.thumbnail,
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
