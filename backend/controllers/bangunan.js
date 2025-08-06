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

// CREATE bangunan baru (DISABLED - hanya untuk edit)
export const addBangunan = async (req, res) => {
  res.status(403).json({
    error: "Akses ditolak",
    message: "Tidak dapat menambah bangunan baru. Gunakan fitur edit saja.",
  });
};

// UPDATE bangunan
export const updateBangunan = async (req, res) => {
  try {
    const id = req.params.id;
    const { nama, interaksi, lantai, thumbnail } = req.body;

    // Hanya update field yang dikirim (tidak undefined)
    const updateData = {};
    if (nama !== undefined) updateData.nama = nama;
    if (interaksi !== undefined) updateData.interaksi = interaksi;
    if (lantai !== undefined) updateData.lantai = lantai;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;

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

    // Validasi tipe file
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(req.file.mimetype)) {
      // Hapus file yang tidak valid
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: "Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP",
      });
    }

    // Buat direktori jika belum ada
    const uploadDir = path.join(
      __dirname,
      "../../frontend/public/img",
      id.toString()
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Path untuk thumbnail baru
    const thumbnailPath = path.join(uploadDir, "thumbnail.jpg");

    // Hapus thumbnail lama jika ada
    if (bangunan.thumbnail) {
      const oldThumbnailPath = path.join(
        __dirname,
        "../../frontend/public",
        bangunan.thumbnail
      );
      if (fs.existsSync(oldThumbnailPath)) {
        fs.unlinkSync(oldThumbnailPath);
      }
    }

    // Pindahkan file yang diupload ke lokasi thumbnail
    fs.renameSync(req.file.path, thumbnailPath);

    // Update database dengan path baru
    const newThumbnailPath = `img/${id}/thumbnail.jpg`;
    await Bangunan.update(
      { thumbnail: newThumbnailPath },
      { where: { id_bangunan: id } }
    );

    // Ambil data bangunan yang sudah diupdate
    const updatedBangunan = await Bangunan.findByPk(id);

    res.json({
      message: "Thumbnail berhasil diupload",
      data: updatedBangunan,
      thumbnailPath: newThumbnailPath,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE bangunan (DISABLED - hanya untuk edit)
export const deleteBangunan = async (req, res) => {
  res.status(403).json({
    error: "Akses ditolak",
    message: "Tidak dapat menghapus bangunan. Gunakan fitur edit saja.",
  });
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
