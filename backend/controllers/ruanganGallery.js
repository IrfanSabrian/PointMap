import RuanganGallery from "../models/RuanganGallery.js";
import Ruangan from "../models/Ruangan.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "../config/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET semua gallery
export const getAllRuanganGallery = async (req, res) => {
  try {
    const data = await RuanganGallery.findAll({
      include: [
        {
          model: Ruangan,
          as: "ruangan",
          attributes: ["id_ruangan", "nama_ruangan"],
        },
      ],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET gallery berdasarkan ID
export const getRuanganGalleryById = async (req, res) => {
  try {
    const id = req.params.id;
    const gallery = await RuanganGallery.findByPk(id, {
      include: [
        {
          model: Ruangan,
          as: "ruangan",
          attributes: ["id_ruangan", "nama_ruangan"],
        },
      ],
    });
    if (!gallery) {
      return res.status(404).json({ error: "Gallery tidak ditemukan" });
    }
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET gallery berdasarkan ruangan
export const getRuanganGalleryByRuangan = async (req, res) => {
  try {
    const ruanganId = req.params.ruanganId;
    const gallery = await RuanganGallery.findAll({
      where: { id_ruangan: ruanganId },
      include: [
        {
          model: Ruangan,
          as: "ruangan",
          attributes: ["id_ruangan", "nama_ruangan"],
        },
      ],
      order: [["created_at", "ASC"]],
    });
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPLOAD GALLERY RUANGAN
export const uploadGallery = async (req, res) => {
  try {
    const { ruanganId } = req.body;

    // Cek apakah ruangan ada
    const ruangan = await Ruangan.findByPk(ruanganId);
    if (!ruangan) {
      return res.status(404).json({ error: "Ruangan tidak ditemukan" });
    }

    // Cek apakah ada file yang diupload
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Tidak ada file yang diupload" });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      // Validasi tipe file
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        // Hapus file yang tidak valid
        fs.unlinkSync(file.path);
        continue;
      }

      // Cek file yang sudah ada di DB untuk menentukan nomor berikutnya
      const existingRecords = await RuanganGallery.findAll({
        where: { id_ruangan: ruanganId },
        order: [["created_at", "ASC"]],
      });
      const existingNumbers = existingRecords
        .map((rec) => {
          const match = rec.nama_file?.match(/gallery(\d+)\.jpg/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter((n) => n > 0)
        .sort((a, b) => a - b);

      let nextNumber = 1;
      if (existingNumbers.length > 0) {
        for (let i = 1; i <= Math.max(...existingNumbers) + 1; i++) {
          if (!existingNumbers.includes(i)) {
            nextNumber = i;
            break;
          }
        }
      }

      // Generate nama file berurutan dan upload ke Cloudinary
      const fileName = `gallery${nextNumber}.jpg`;
      const folder = `img/${ruangan.id_bangunan}/ruangan/${ruanganId}`;
      const publicId = fileName.replace(/\.[^.]+$/, "");

      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
        format: "jpg",
      });

      // Hapus file sementara
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      // Simpan ke database dgn URL Cloudinary
      const galleryData = await RuanganGallery.create({
        id_ruangan: ruanganId,
        nama_file: fileName,
        path_file: uploadResult.secure_url,
      });

      uploadedFiles.push(galleryData);
    }

    res.json({
      message: `${uploadedFiles.length} gambar berhasil diupload`,
      data: uploadedFiles,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// REORDER GALLERY
export const reorderGallery = async (req, res) => {
  try {
    const { ruanganId, galleryOrder } = req.body;

    if (!galleryOrder || !Array.isArray(galleryOrder)) {
      return res.status(400).json({ error: "Urutan gallery tidak valid" });
    }

    // Untuk saat ini, kita hanya mengembalikan data yang sudah diurutkan
    // karena tidak ada field urutan di database
    const galleryData = await RuanganGallery.findAll({
      where: { id_ruangan: ruanganId },
      include: [
        {
          model: Ruangan,
          as: "ruangan",
          attributes: ["id_ruangan", "nama_ruangan"],
        },
      ],
      order: [["id_gallery", "ASC"]], // Urutkan berdasarkan ID
    });

    // Filter dan urutkan berdasarkan galleryOrder yang diberikan
    const orderedGallery = galleryOrder
      .map((id) => galleryData.find((item) => item.id_gallery == id))
      .filter(Boolean);

    res.json({
      message: "Urutan gallery berhasil diupdate",
      data: orderedGallery,
    });
  } catch (err) {
    console.error("Error reordering gallery:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE GALLERY
export const deleteGallery = async (req, res) => {
  try {
    const id = req.params.id;

    // Cek apakah gallery ada
    const gallery = await RuanganGallery.findByPk(id);
    if (!gallery) {
      return res.status(404).json({ error: "Gallery tidak ditemukan" });
    }

    // Jika path_file adalah URL Cloudinary, hapus asset di Cloudinary
    if (gallery.path_file?.includes("res.cloudinary.com")) {
      try {
        // Derive public_id from URL: folder/.../name.ext -> folder/.../name
        const url = new URL(gallery.path_file);
        const parts = url.pathname.split("/").filter(Boolean);
        const uploadIdx = parts.findIndex((p) => p === "upload");
        let publicParts =
          uploadIdx >= 0 ? parts.slice(uploadIdx + 1) : parts.slice(1);
        // remove version segment if present (v123...)
        if (publicParts[0] && /^v\d+/.test(publicParts[0])) {
          publicParts = publicParts.slice(1);
        }
        const last = publicParts.pop() || "";
        const baseName = last.replace(/\.[^.]+$/, "");
        const publicId = [...publicParts, baseName].join("/");
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        // ignore cleanup errors
      }
    }

    // Hapus dari database
    await RuanganGallery.destroy({
      where: { id_gallery: id },
    });

    res.json({ message: "Gallery berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
