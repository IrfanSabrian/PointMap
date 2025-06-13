import Gedung from "../models/Gedung.js";

export const getAllGedung = async (req, res) => {
  const data = await Gedung.findAll();
  res.json(data);
};

export const addGedung = async (req, res) => {
  const { nama, kode, jumlah_lantai, jenis_gedung } = req.body;
  try {
    const baru = await Gedung.create({
      nama,
      kode,
      jumlah_lantai,
      jenis_gedung,
    });
    res.status(201).json(baru);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
