import Prodi from "../models/Prodi.js";

// GET semua prodi
export const getAllProdi = async (req, res) => {
  try {
    const data = await Prodi.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE prodi baru
export const addProdi = async (req, res) => {
  try {
    const { id_jurusan, nama_prodi } = req.body;
    const baru = await Prodi.create({ id_jurusan, nama_prodi });
    res.status(201).json({
      message: "Prodi berhasil ditambahkan",
      data: baru,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE prodi
export const updateProdi = async (req, res) => {
  try {
    const id = req.params.id;
    const { id_jurusan, nama_prodi } = req.body;
    const [updated] = await Prodi.update(
      { id_jurusan, nama_prodi },
      { where: { id_prodi: id } }
    );
    if (updated) {
      const updatedProdi = await Prodi.findByPk(id);
      res.json({
        message: "Prodi berhasil diperbarui",
        data: updatedProdi,
      });
    } else {
      res.status(404).json({ error: "Prodi tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE prodi
export const deleteProdi = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedProdi = await Prodi.findByPk(id);
    if (!deletedProdi) {
      return res.status(404).json({ error: "Prodi tidak ditemukan" });
    }
    await deletedProdi.destroy();
    res.json({
      message: "Prodi berhasil dihapus",
      data: deletedProdi,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
