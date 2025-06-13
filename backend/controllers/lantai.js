import Lantai from "../models/Lantai.js";

export const getLantaiByGedung = async (req, res) => {
  const { gedung } = req.query;
  try {
    const lantai = await Lantai.findAll({ where: { id_gedung: gedung } });
    res.json(lantai);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addLantai = async (req, res) => {
  try {
    const { nama_lantai, nomor_lantai, id_gedung } = req.body;
    const lantaiBaru = await Lantai.create({
      nama_lantai,
      nomor_lantai,
      id_gedung,
    });
    res.status(201).json(lantaiBaru);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLantai = async (req, res) => {
  try {
    const id = req.params.id;
    const { nama_lantai, nomor_lantai, id_gedung } = req.body;
    const [updated] = await Lantai.update(
      { nama_lantai, nomor_lantai, id_gedung },
      { where: { id } }
    );
    if (updated) {
      const updatedLantai = await Lantai.findByPk(id);
      res.json(updatedLantai);
    } else {
      res.status(404).json({ error: "Lantai tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteLantai = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Lantai.destroy({ where: { id } });
    if (deleted) {
      res.json({ message: "Lantai berhasil dihapus" });
    } else {
      res.status(404).json({ error: "Lantai tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
