import Bangunan from "../models/Bangunan.js";

// GET semua bangunan
export const getAllBangunan = async (req, res) => {
  try {
    const data = await Bangunan.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET bangunan berdasarkan ID
export const getBangunanById = async (req, res) => {
  try {
    const id = req.params.id;
    const bangunan = await Bangunan.findByPk(id);
    if (!bangunan) {
      return res.status(404).json({ error: "Bangunan tidak ditemukan" });
    }
    res.json(bangunan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE bangunan baru
export const addBangunan = async (req, res) => {
  try {
    const { nama, interaksi, lantai, geometri } = req.body;
    const baru = await Bangunan.create({ nama, interaksi, lantai, geometri });
    res.status(201).json({
      message: "Bangunan berhasil ditambahkan",
      data: baru,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE bangunan
export const updateBangunan = async (req, res) => {
  try {
    const id = req.params.id;
    const { nama, interaksi, lantai, geometri } = req.body;
    const [updated] = await Bangunan.update(
      { nama, interaksi, lantai, geometri },
      { where: { id_bangunan: id } }
    );
    if (updated) {
      const updatedBangunan = await Bangunan.findByPk(id);
      res.json({
        message: "Bangunan berhasil diperbarui",
        data: updatedBangunan,
      });
    } else {
      res.status(404).json({ error: "Bangunan tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE bangunan
export const deleteBangunan = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedBangunan = await Bangunan.findByPk(id);
    if (!deletedBangunan) {
      return res.status(404).json({ error: "Bangunan tidak ditemukan" });
    }
    await deletedBangunan.destroy();
    res.json({
      message: "Bangunan berhasil dihapus",
      data: deletedBangunan,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBangunanGeoJSON = async (req, res) => {
  try {
    const bangunan = await Bangunan.findAll();
    const features = bangunan.map((b) => ({
      type: "Feature",
      geometry: JSON.parse(b.geometri),
      properties: {
        id: b.id_bangunan,
        nama: b.nama,
        interaksi: b.interaksi,
        lantai: b.lantai,
      },
    }));
    res.json({
      type: "FeatureCollection",
      features,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
