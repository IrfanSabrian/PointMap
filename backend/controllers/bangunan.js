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

// CREATE bangunan baru (DISABLED - hanya untuk edit)
export const addBangunan = async (req, res) => {
  res.status(403).json({
    error: "Akses ditolak",
    message: "Tidak dapat menambah bangunan baru. Gunakan fitur edit saja.",
  });
};

// UPDATE bangunan
export const updateBangunan = async (req, res) => {
  try {
    const id = req.params.id;
    const { nama, interaksi, lantai, thumbnail } = req.body;
    const [updated] = await Bangunan.update(
      { nama, interaksi, lantai, thumbnail },
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

// DELETE bangunan (DISABLED - hanya untuk edit)
export const deleteBangunan = async (req, res) => {
  res.status(403).json({
    error: "Akses ditolak",
    message: "Tidak dapat menghapus bangunan. Gunakan fitur edit saja.",
  });
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
        thumbnail: b.thumbnail,
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
