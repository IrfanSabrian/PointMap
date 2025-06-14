import Gedung from "../models/Gedung.js";

// GET semua gedung
export const getAllGedung = async (req, res) => {
  try {
    const data = await Gedung.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE (tambah) gedung baru
export const addGedung = async (req, res) => {
  const { nama, kode, jumlah_lantai, jenis_gedung } = req.body;
  try {
    const baru = await Gedung.create({
      nama,
      kode,
      jumlah_lantai,
      jenis_gedung,
      latitude,
      longitude,
      x_pixel,
      y_pixel,
    });
    res.status(201).json({
      message: "Gedung berhasil ditambahkan",
      data: baru,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE gedung
export const updateGedung = async (req, res) => {
  const id = req.params.id;
  const { nama, kode, jumlah_lantai, jenis_gedung } = req.body;
  try {
    const [updated] = await Gedung.update(
      { nama, kode, jumlah_lantai, jenis_gedung, latitude, longitude, x_pixel, y_pixel },
      { where: { id } }
    );
    if (updated) {
      const updatedGedung = await Gedung.findByPk(id);
      res.json({
        message: "Gedung berhasil diperbarui",
        data: updatedGedung,
      });
    } else {
      res.status(404).json({ error: "Gedung tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE gedung
export const deleteGedung = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedGedung = await Gedung.findByPk(id);
    if (!deletedGedung) {
      return res.status(404).json({ error: "Gedung tidak ditemukan" });
    }
    await deletedGedung.destroy();
    res.json({
      message: "Gedung berhasil dihapus",
      data: deletedGedung,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
