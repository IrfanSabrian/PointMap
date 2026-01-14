import RuanganGallery from "../models/RuanganGallery.js";
import Ruangan from "../models/Ruangan.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define Frontend Public Path
// backend/controllers -> backend -> .. -> frontend -> public
const FRONTEND_PUBLIC_PATH = path.join(
  __dirname,
  "..",
  "..",
  "frontend",
  "public"
);

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

    // Cek apakah ruangan ada untuk mendapatkan ID Bangunan
    const ruangan = await Ruangan.findByPk(ruanganId);
    if (!ruangan) {
      // Clean up uploaded files
      if (req.files) {
        req.files.forEach((file) => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      }
      return res.status(404).json({ error: "Ruangan tidak ditemukan" });
    }

    // Cek apakah ada file yang diupload
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Tidak ada file yang diupload" });
    }

    const uploadedFiles = [];

    // 1. Tentukan folder target: frontend/public/img/{bangunanId}/ruangan/{ruanganId}
    const relativeDir = path.join(
      "img",
      String(ruangan.id_bangunan),
      "ruangan",
      String(ruanganId)
    );
    const targetDir = path.join(FRONTEND_PUBLIC_PATH, relativeDir);

    // 2. Buat folder jika belum ada (recursive)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    for (const file of req.files) {
      // 3. Tentukan nama file berikutnya (Sequential: gallery1, gallery2, ...)
      const ext = path.extname(file.originalname).toLowerCase(); // Simpan ekstensi asli

      let nextNumber = 1;
      // Cek apakah file gallery{N}.ext sudah ada. Kita cek semua kemungkinan 'gallery' pattern.
      // Cara paling aman: list semua file di folder, filter yang depannya 'gallery', ambil angkanya, cari max.

      const filesInDir = fs.readdirSync(targetDir);
      const numbers = filesInDir.map((f) => {
        const match = f.match(/^gallery(\d+)\./);
        return match ? parseInt(match[1]) : 0;
      });

      if (numbers.length > 0) {
        nextNumber = Math.max(...numbers) + 1;
      }

      const newFileName = `gallery${nextNumber}${ext}`;
      const targetPath = path.join(targetDir, newFileName);

      // 4. Pindahkan file dari temp storage (uploads/) ke target folder
      // Menggunakan copyFileSync + unlinkSync agar aman lintas partisi, atau renameSync jika satu partisi.
      // Kita pakai copy + unlink untuk keamanan.
      fs.copyFileSync(file.path, targetPath);
      fs.unlinkSync(file.path); // Hapus file temp

      // 5. Simpan path ke Database: img/{bangunanId}/ruangan/{ruanganId}/galleryN.ext
      // Gunakan forward slash '/' agar konsisten di URL
      const dbPath = `img/${ruangan.id_bangunan}/ruangan/${ruanganId}/${newFileName}`;

      const galleryData = await RuanganGallery.create({
        id_ruangan: ruanganId,
        nama_file: newFileName,
        path_file: dbPath,
      });

      uploadedFiles.push(galleryData);
    }

    res.json({
      message: `${uploadedFiles.length} gambar berhasil diupload`,
      data: uploadedFiles,
    });
  } catch (err) {
    console.error("🔥 Error uploading gallery:", err);
    // Cleanup any files that might have been uploaded if DB op fails
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {}
        }
      });
    }
    res.status(500).json({
      error: err.message || "Terjadi kesalahan internal pada server",
      details: String(err),
    });
  }
};

// REORDER GALLERY
export const reorderGallery = async (req, res) => {
  try {
    const { ruanganId, galleryOrder } = req.body;

    if (!galleryOrder || !Array.isArray(galleryOrder)) {
      return res.status(400).json({ error: "Urutan gallery tidak valid" });
    }

    const galleryData = await RuanganGallery.findAll({
      where: { id_ruangan: ruanganId },
      include: [
        {
          model: Ruangan,
          as: "ruangan",
          attributes: ["id_ruangan", "nama_ruangan"],
        },
      ],
      order: [["id_gallery", "ASC"]],
    });

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

    // Hapus file fisik jika ada
    if (gallery.path_file) {
      // path_file contohnya: "img/27/ruangan/2/gallery1.jpg"
      // Kita perlu resolve ini relatif terhadap folder PUBLIC frontend

      const relativePath = gallery.path_file;
      const absolutePath = path.join(FRONTEND_PUBLIC_PATH, relativePath);

      if (fs.existsSync(absolutePath)) {
        try {
          fs.unlinkSync(absolutePath);
        } catch (e) {
          console.warn(`Failed to delete file ${absolutePath}:`, e);
        }
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
