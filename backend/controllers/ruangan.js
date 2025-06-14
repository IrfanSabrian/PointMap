import Ruangan from "../models/Ruangan.js";

// GET semua ruangan berdasarkan lantai (query: ?lantai=ID)
export const getRuanganByLantai = async (req, res) => {
  const { lantai } = req.query;
  try {
    const ruangan = await Ruangan.findAll({
      where: { id_lantai: lantai },
    });
    res.json(ruangan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE ruangan baru
export const addRuangan = async (req, res) => {
  try {
    const {
      nama_ruangan,
      id_lantai,
      id_gedung,
      id_prodi,
      fungsi,
      x_pixel,
      y_pixel,
    } = req.body;
    const ruanganBaru = await Ruangan.create({
      nama_ruangan,
      id_lantai,
      id_gedung,
      id_prodi,
      fungsi,
      x_pixel,
      y_pixel,
    });
    res.status(201).json({
      message: "Ruangan berhasil ditambahkan",
      data: ruanganBaru,
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
      id_lantai,
      id_gedung,
      id_prodi,
      fungsi,
      x_pixel,
      y_pixel,
    } = req.body;
    const [updated] = await Ruangan.update(
      {
        nama_ruangan,
        id_lantai,
        id_gedung,
        id_prodi,
        fungsi,
        x_pixel,
        y_pixel,
      },
      { where: { id } }
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

// DELETE ruangan
export const deleteRuangan = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedRuangan = await Ruangan.findByPk(id);
    if (!deletedRuangan) {
      return res.status(404).json({ error: "Ruangan tidak ditemukan" });
    }
    await deletedRuangan.destroy();
    res.json({
      message: "Ruangan berhasil dihapus",
      data: deletedRuangan,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
