import Lantai from "../models/Lantai.js";

// GET semua lantai berdasarkan bangunan (query: ?bangunan=ID)
export const getLantaiByBangunan = async (req, res) => {
  const { bangunan } = req.query;
  try {
    const lantai = await Lantai.findAll({ where: { id_bangunan: bangunan } });
    res.json(lantai);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE lantai baru
export const addLantai = async (req, res) => {
  try {
    const { nama_lantai, nomor_lantai, id_bangunan } = req.body;
    const lantaiBaru = await Lantai.create({
      nama_lantai,
      nomor_lantai,
      id_bangunan,
    });
    res.status(201).json({
      message: "Lantai berhasil ditambahkan",
      data: lantaiBaru,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE lantai
export const updateLantai = async (req, res) => {
  try {
    const id = req.params.id;
    const { nama_lantai, nomor_lantai, id_bangunan } = req.body;
    const [updated] = await Lantai.update(
      { nama_lantai, nomor_lantai, id_bangunan },
      { where: { id_lantai: id } }
    );
    if (updated) {
      const updatedLantai = await Lantai.findByPk(id);
      res.json({
        message: "Lantai berhasil diperbarui",
        data: updatedLantai,
      });
    } else {
      res.status(404).json({ error: "Lantai tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE lantai
export const deleteLantai = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedLantai = await Lantai.findByPk(id);
    if (!deletedLantai) {
      return res.status(404).json({ error: "Lantai tidak ditemukan" });
    }
    await deletedLantai.destroy();
    res.json({
      message: "Lantai berhasil dihapus",
      data: deletedLantai,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
