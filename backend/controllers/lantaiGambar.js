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

    // Buat direktori jika belum ada
    const uploadDir = path.join(
      __dirname,
      "../../frontend/public/img",
      id_bangunan.toString(),
      "lantai"
    );
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate nama file
    const nama_file = `Lt${nomor_lantai}.svg`;
    const path_file = path.join(uploadDir, nama_file);

    // Pindahkan file dari uploads sementara ke lokasi final
    fs.renameSync(req.file.path, path_file);

    // Path untuk database (relative dari public)
    const dbPath = `img/${id_bangunan}/lantai/${nama_file}`;

    // Cek apakah sudah ada gambar untuk lantai ini
    const existingLantai = await LantaiGambar.findOne({
      where: {
        id_bangunan: id_bangunan,
        nama_file: nama_file,
      },
    });

    let result;
    if (existingLantai) {
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

// DELETE lantai gambar
export const deleteLantaiGambar = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedLantaiGambar = await LantaiGambar.findByPk(id);
    if (!deletedLantaiGambar) {
      return res.status(404).json({ error: "Lantai gambar tidak ditemukan" });
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
