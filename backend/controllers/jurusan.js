import Jurusan from "../models/Jurusan.js";

// GET semua jurusan
export const getAllJurusan = async (req, res) => {
  try {
    const data = await Jurusan.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE jurusan baru
export const addJurusan = async (req, res) => {
  try {
    const { nama_jurusan } = req.body;
    const baru = await Jurusan.create({ nama_jurusan });
    res.status(201).json({
      message: "Jurusan berhasil ditambahkan",
      data: baru,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE jurusan
export const updateJurusan = async (req, res) => {
  try {
    const id = req.params.id;
    const { nama_jurusan } = req.body;
    const [updated] = await Jurusan.update(
      { nama_jurusan },
      { where: { id_jurusan: id } }
    );
    if (updated) {
      const updatedJurusan = await Jurusan.findByPk(id);
      res.json({
        message: "Jurusan berhasil diperbarui",
        data: updatedJurusan,
      });
    } else {
      res.status(404).json({ error: "Jurusan tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE jurusan
export const deleteJurusan = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedJurusan = await Jurusan.findByPk(id);
    if (!deletedJurusan) {
      return res.status(404).json({ error: "Jurusan tidak ditemukan" });
    }
    await deletedJurusan.destroy();
    res.json({
      message: "Jurusan berhasil dihapus",
      data: deletedJurusan,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
