import { Ruangan } from "../models/index.js";

// GET semua ruangan
export const getAllRuangan = async (req, res) => {
  try {
    const ruangan = await Ruangan.findAll({
      order: [["nama_ruangan", "ASC"]],
    });
    res.json(ruangan);
  } catch (err) {
    console.error("Error in getAllRuangan:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET semua ruangan berdasarkan nomor lantai (query: ?lantai=nomor)
export const getRuanganByLantai = async (req, res) => {
  const { lantai } = req.query;
  try {
    const ruangan = await Ruangan.findAll({
      where: { nomor_lantai: lantai },
    });
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

// CREATE ruangan baru (DISABLED - hanya untuk edit)
export const addRuangan = async (req, res) => {
  res.status(403).json({
    error: "Akses ditolak",
    message: "Tidak dapat menambah ruangan baru. Gunakan fitur edit saja.",
  });
};

// UPDATE ruangan
export const updateRuangan = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      nama_ruangan,
      nomor_lantai,
      id_bangunan,
      nama_jurusan,
      nama_prodi,
    } = req.body;
    const [updated] = await Ruangan.update(
      {
        nama_ruangan,
        nomor_lantai,
        id_bangunan,
        nama_jurusan,
        nama_prodi,
      },
      { where: { id_ruangan: id } }
    );
    if (updated) {
      const updatedRuangan = await Ruangan.findByPk(id);
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

// DELETE ruangan (DISABLED - hanya untuk edit)
export const deleteRuangan = async (req, res) => {
  res.status(403).json({
    error: "Akses ditolak",
    message: "Tidak dapat menghapus ruangan. Gunakan fitur edit saja.",
  });
};
