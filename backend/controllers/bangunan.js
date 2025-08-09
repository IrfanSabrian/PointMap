import Bangunan from "../models/Bangunan.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "../config/cloudinary.js";

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

    // Upload ke Cloudinary dengan struktur folder yang sama
    const folder = `img/${id}`;
    const publicId = `thumbnail`;
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder,
      public_id: publicId,
      overwrite: true,
      resource_type: "image",
      format: undefined, // biarkan Cloudinary deteksi
    });

    // Hapus file sementara
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Simpan URL Cloudinary ke database
    await Bangunan.update(
      { thumbnail: uploadResult.secure_url },
      { where: { id_bangunan: id } }
    );

    // Ambil data bangunan yang sudah diupdate
    const updatedBangunan = await Bangunan.findByPk(id);

    res.json({
      message: "Thumbnail berhasil diupload",
      data: updatedBangunan,
      thumbnailPath: uploadResult.secure_url,
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
