import Ruangan from "../models/Ruangan.js";

// GET ruangan berdasarkan id_lantai (query: ?lantai=ID)
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

// POST tambah ruangan
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
      latitude,
      longitude,
    } = req.body;
    const ruanganBaru = await Ruangan.create({
      nama_ruangan,
      id_lantai,
      id_gedung,
      id_prodi,
      fungsi,
      x_pixel,
      y_pixel,
      latitude,
      longitude,
    });
    res.status(201).json(ruanganBaru);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT update ruangan
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
      latitude,
      longitude,
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
        latitude,
        longitude,
      },
      { where: { id } }
    );
    if (updated) {
      const updatedRuangan = await Ruangan.findByPk(id);
      res.json(updatedRuangan);
    } else {
      res.status(404).json({ error: "Ruangan tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE hapus ruangan
export const deleteRuangan = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Ruangan.destroy({ where: { id } });
    if (deleted) {
      res.json({ message: "Ruangan berhasil dihapus" });
    } else {
      res.status(404).json({ error: "Ruangan tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
