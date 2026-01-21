import Ruangan from "../models/Ruangan.js";
import Bangunan from "../models/Bangunan.js";
import RuanganGallery from "../models/RuanganGallery.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET semua ruangan
export const getAllRuangan = async (req, res) => {
  try {
    const data = await Ruangan.findAll({
      include: [
        {
          model: Bangunan,
          as: "bangunan",
          attributes: ["id_bangunan", "nama"],
        },
      ],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ruangan berdasarkan ID
export const getRuanganById = async (req, res) => {
  try {
    const id = req.params.id;
    const ruangan = await Ruangan.findByPk(id, {
      include: [
        {
          model: Bangunan,
          as: "bangunan",
          attributes: ["id_bangunan", "nama"],
        },
      ],
    });
    if (!ruangan) {
      return res.status(404).json({ error: "Ruangan tidak ditemukan" });
    }
    res.json(ruangan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ruangan berdasarkan id_bangunan dan dikelompokkan berdasarkan lantai
export const getRuanganByBangunan = async (req, res) => {
  try {
    const { id_bangunan } = req.params;
    const ruangan = await Ruangan.findAll({
      where: { id_bangunan: id_bangunan },
      order: [["nomor_lantai", "ASC"]],
    });

    // Kelompokkan ruangan berdasarkan lantai
    const ruanganByLantai = {};
    ruangan.forEach((r) => {
      const lantai = r.nomor_lantai;
      if (!ruanganByLantai[lantai]) {
        ruanganByLantai[lantai] = [];
      }

      // Data ruangan sudah lengkap dengan nama_jurusan dan nama_prodi
      const ruanganData = r.toJSON();
      ruanganByLantai[lantai].push(ruanganData);
    });

    res.json(ruanganByLantai);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ruangan untuk tampilan 3D dengan posisi pin dinamis
export const getRuanganFor3DView = async (req, res) => {
  try {
    const { id_bangunan } = req.params;
    const ruangan = await Ruangan.findAll({
      where: { id_bangunan: id_bangunan },
      order: [
        ["nomor_lantai", "ASC"],
        ["id_ruangan", "ASC"],
      ],
    });

    // Kelompokkan ruangan berdasarkan lantai dan tambahkan data pin dinamis
    const ruanganByLantai = {};
    const levelCounters = {}; // Counter untuk setiap level

    ruangan.forEach((r) => {
      const lantai = r.nomor_lantai;
      if (!ruanganByLantai[lantai]) {
        ruanganByLantai[lantai] = [];
        levelCounters[lantai] = 0;
      }

      levelCounters[lantai]++; // Increment counter untuk level ini
      const pinIndex = levelCounters[lantai];

      const ruanganData = r.toJSON();

      // Tambahkan data pin dinamis
      const pinData = {
        ...ruanganData,
        pin_class: `pin--${lantai}-${pinIndex}`, // Use level-specific counter
        pin_position: {
          top: ruanganData.posisi_y ? `${ruanganData.posisi_y}%` : null,
          left: ruanganData.posisi_x ? `${ruanganData.posisi_x}%` : null,
        },
        // Fallback ke posisi hardcoded jika tidak ada data dinamis
        fallback_position: getFallbackPinPosition(lantai, pinIndex),
      };

      ruanganByLantai[lantai].push(pinData);
    });

    res.json(ruanganByLantai);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper function untuk mendapatkan posisi fallback dari CSS hardcoded
const getFallbackPinPosition = (lantai, index) => {
  const fallbackPositions = {
    1: {
      1: { top: 60, left: 8 },
      2: { top: 15, left: 15 },
      3: { top: 15, left: 88 },
      4: { top: 40, left: 77 },
      5: { top: 33, left: 38 },
      6: { top: 6, left: 27 },
      7: { top: 36, left: 61 },
      8: { top: 9, left: 59 },
      9: { top: 8, left: 51 },
    },
    2: {
      1: { top: 7, left: 22 },
      2: { top: 39, left: 5 },
      3: { top: 21, left: 84 },
      4: { top: 39, left: 53 },
      5: { top: 14, left: 50 },
      6: { top: 60, left: 15 },
      7: { top: 34, left: 37 },
      8: { top: 52, left: 74 },
    },
    3: {
      1: { top: 17, left: 15 },
      2: { top: 42, left: 5 },
      3: { top: 19, left: 85 },
      4: { top: 61, left: 57 },
      5: { top: 58, left: 25 },
      6: { top: 30, left: 57 },
      7: { top: 32, left: 37 },
    },
    4: {
      1: { top: 55, left: 21 },
      2: { top: 18, left: 20 },
      3: { top: 21, left: 88 },
      4: { top: 52, left: 74 },
      5: { top: 33, left: 38 },
      6: { top: 39, left: 56 },
      7: { top: 58, left: 10 },
    },
  };

  // Smart constraint for fallback position with pin size consideration
  const fallback = fallbackPositions[lantai]?.[index] || { top: 50, left: 50 };

  // Calculate pin size in percentage
  const pinWidthPercent = 4;
  const pinHeightPercent = 6;

  // Use more conservative bounds to ensure pins stay within SVG
  return {
    top: Math.max(
      pinHeightPercent,
      Math.min(fallback.top, 100 - pinHeightPercent),
    ),
    left: Math.max(
      pinWidthPercent,
      Math.min(fallback.left, 100 - pinWidthPercent),
    ),
  };
};

// CREATE ruangan baru
export const createRuangan = async (req, res) => {
  try {
    const {
      nama_ruangan,
      nomor_lantai,
      id_bangunan,
      nama_jurusan,
      nama_prodi,
      pin_style = "default",
      posisi_x,
      posisi_y,
    } = req.body;

    // Validasi data wajib
    if (!nama_ruangan || !nomor_lantai || !id_bangunan) {
      return res.status(400).json({
        error: "Nama ruangan, nomor lantai, dan ID bangunan wajib diisi",
      });
    }

    const newRuangan = await Ruangan.create({
      nama_ruangan,
      nomor_lantai,
      id_bangunan,
      nama_jurusan,
      nama_prodi,
      pin_style,
      posisi_x,
      posisi_y,
    });

    const createdRuangan = await Ruangan.findByPk(newRuangan.id_ruangan, {
      include: [
        {
          model: Bangunan,
          as: "bangunan",
          attributes: ["id_bangunan", "nama"],
        },
      ],
    });

    res.status(201).json({
      message: "Ruangan berhasil dibuat",
      data: createdRuangan,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE ruangan
export const updateRuangan = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      nama_ruangan,
      nomor_lantai,
      nama_jurusan,
      nama_prodi,
      pin_style,
      posisi_x,
      posisi_y,
    } = req.body;

    const [updated] = await Ruangan.update(
      {
        nama_ruangan,
        nomor_lantai,
        nama_jurusan,
        nama_prodi,
        pin_style,
        posisi_x,
        posisi_y,
      },
      { where: { id_ruangan: id } },
    );

    if (updated) {
      const updatedRuangan = await Ruangan.findByPk(id, {
        include: [
          {
            model: Bangunan,
            as: "bangunan",
            attributes: ["id_bangunan", "nama"],
          },
        ],
      });
      res.json({
        message: "Ruangan berhasil diperbarui",
        data: updatedRuangan,
      });
    } else {
      res.status(404).json({ error: "Ruangan tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE ruangan
export const deleteRuangan = async (req, res) => {
  try {
    const id = req.params.id;

    // Check for gallery items
    const galeriCount = await RuanganGallery.count({
      where: { id_ruangan: id },
    });

    // If any gallery items exist, return error
    if (galeriCount > 0) {
      return res.status(400).json({
        error:
          "Tidak dapat menghapus ruangan karena masih memiliki foto galeri",
        dependencies: {
          galeri: galeriCount,
        },
        message: `Ruangan masih memiliki ${galeriCount} foto galeri`,
      });
    }

    // If no dependencies, proceed with delete
    const deleted = await Ruangan.destroy({
      where: { id_ruangan: id },
    });

    if (deleted) {
      res.json({
        message: "Ruangan berhasil dihapus",
      });
    } else {
      res.status(404).json({ error: "Ruangan tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
