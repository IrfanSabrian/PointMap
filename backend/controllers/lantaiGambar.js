import { LantaiGambar, Bangunan } from "../models/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET semua lantai gambar
export const getAllLantaiGambar = async (req, res) => {
  try {
    const data = await LantaiGambar.findAll({
      include: [
        {
          model: Bangunan,
          as: "bangunan",
          attributes: ["id_bangunan", "nama"],
        },
      ],
      order: [
        ["id_bangunan", "ASC"],
        ["nama_file", "ASC"],
      ],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET lantai gambar berdasarkan ID
export const getLantaiGambarById = async (req, res) => {
  try {
    const id = req.params.id;
    const lantaiGambar = await LantaiGambar.findByPk(id, {
      include: [
        {
          model: Bangunan,
          as: "bangunan",
          attributes: ["id_bangunan", "nama"],
        },
      ],
    });
    if (!lantaiGambar) {
      return res.status(404).json({ error: "Lantai gambar tidak ditemukan" });
    }
    res.json(lantaiGambar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET lantai gambar berdasarkan ID bangunan
export const getLantaiGambarByBangunan = async (req, res) => {
  try {
    const { id_bangunan } = req.params;
    const lantaiGambar = await LantaiGambar.findAll({
      where: { id_bangunan: id_bangunan },
      include: [
        {
          model: Bangunan,
          as: "bangunan",
          attributes: ["id_bangunan", "nama"],
        },
      ],
      order: [["nama_file", "ASC"]],
    });
    res.json(lantaiGambar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE lantai gambar baru
export const addLantaiGambar = async (req, res) => {
  try {
    const { id_bangunan, nomor_lantai } = req.body;

    // Cek apakah ada file yang diupload
    if (!req.file) {
      return res.status(400).json({ error: "Tidak ada file yang diupload" });
    }

    // Cek apakah bangunan ada
    const bangunan = await Bangunan.findByPk(id_bangunan);
    if (!bangunan) {
      // Hapus file yang diupload jika bangunan tidak ditemukan
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Bangunan tidak ditemukan" });
    }

    // Generate nama file sesuai pola
    const nama_file = `Lt${nomor_lantai}.svg`;

    // Path untuk menyimpan file
    const uploadDir = path.join(__dirname, "../uploads/floor-plans");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename to avoid conflicts between buildings
    const fileName = `${id_bangunan}_${nama_file}`;
    const filePath = path.join(uploadDir, fileName);

    // Move uploaded file to final location
    fs.copyFileSync(req.file.path, filePath);
    fs.unlinkSync(req.file.path); // Delete temp file

    // Path untuk database (relative path untuk serving via express.static)
    const dbPath = `uploads/floor-plans/${fileName}`;

    // Cek apakah sudah ada gambar untuk lantai ini
    const existingLantai = await LantaiGambar.findOne({
      where: {
        id_bangunan: id_bangunan,
        nama_file: nama_file,
      },
    });

    let result;
    if (existingLantai) {
      // Hapus file lama jika ada dan berbeda
      if (
        existingLantai.path_file &&
        !existingLantai.path_file.startsWith("http")
      ) {
        const oldFilePath = path.join(
          __dirname,
          "..",
          existingLantai.path_file
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update jika sudah ada
      await LantaiGambar.update(
        { path_file: dbPath },
        { where: { id_lantai_gambar: existingLantai.id_lantai_gambar } }
      );
      result = await LantaiGambar.findByPk(existingLantai.id_lantai_gambar);
    } else {
      // Create baru jika belum ada
      result = await LantaiGambar.create({
        id_bangunan,
        nama_file,
        path_file: dbPath,
      });
    }

    res.status(201).json({
      message: "Lantai gambar berhasil ditambahkan",
      data: result,
    });
  } catch (err) {
    // Hapus file jika ada error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message });
  }
};

// UPDATE lantai gambar
export const updateLantaiGambar = async (req, res) => {
  try {
    const id = req.params.id;
    const { id_bangunan, nama_file, path_file } = req.body;
    const [updated] = await LantaiGambar.update(
      { id_bangunan, nama_file, path_file },
      { where: { id_lantai_gambar: id } }
    );
    if (updated) {
      const updatedLantaiGambar = await LantaiGambar.findByPk(id);
      res.json({
        message: "Lantai gambar berhasil diperbarui",
        data: updatedLantaiGambar,
      });
    } else {
      res.status(404).json({ error: "Lantai gambar tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteLantaiGambar = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedLantaiGambar = await LantaiGambar.findByPk(id);
    if (!deletedLantaiGambar) {
      return res.status(404).json({ error: "Lantai gambar tidak ditemukan" });
    }

    // Hapus file lokal jika bukan URL Cloudinary
    if (
      deletedLantaiGambar.path_file &&
      !deletedLantaiGambar.path_file.startsWith("http")
    ) {
      const filePath = path.join(
        __dirname,
        "..",
        deletedLantaiGambar.path_file
      );
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error("Error deleting file:", e);
        }
      }
    }

    await deletedLantaiGambar.destroy();
    res.json({
      message: "Lantai gambar berhasil dihapus",
      data: deletedLantaiGambar,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
