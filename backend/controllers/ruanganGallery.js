import { RuanganGallery, Ruangan } from "../models/index.js";

// GET semua ruangan gallery
export const getAllRuanganGallery = async (req, res) => {
  try {
    const data = await RuanganGallery.findAll({
      include: [
        {
          model: Ruangan,
          as: "ruangan",
          attributes: ["id_ruangan", "nama_ruangan"],
        },
      ],
      order: [
        ["id_ruangan", "ASC"],
        ["nama_file", "ASC"],
      ],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ruangan gallery berdasarkan ID
export const getRuanganGalleryById = async (req, res) => {
  try {
    const id = req.params.id;
    const ruanganGallery = await RuanganGallery.findByPk(id, {
      include: [
        {
          model: Ruangan,
          as: "ruangan",
          attributes: ["id_ruangan", "nama_ruangan"],
        },
      ],
    });
    if (!ruanganGallery) {
      return res.status(404).json({ error: "Ruangan gallery tidak ditemukan" });
    }
    res.json(ruanganGallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ruangan gallery berdasarkan ID ruangan
export const getRuanganGalleryByRuangan = async (req, res) => {
  try {
    const { id_ruangan } = req.params;
    const ruanganGallery = await RuanganGallery.findAll({
      where: { id_ruangan: id_ruangan },
      include: [
        {
          model: Ruangan,
          as: "ruangan",
          attributes: ["id_ruangan", "nama_ruangan"],
        },
      ],
      order: [["nama_file", "ASC"]],
    });
    res.json(ruanganGallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE ruangan gallery baru
export const addRuanganGallery = async (req, res) => {
  try {
    const { id_ruangan, nama_file, path_file } = req.body;
    const baru = await RuanganGallery.create({
      id_ruangan,
      nama_file,
      path_file,
    });
    res.status(201).json({
      message: "Ruangan gallery berhasil ditambahkan",
      data: baru,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE ruangan gallery
export const updateRuanganGallery = async (req, res) => {
  try {
    const id = req.params.id;
    const { id_ruangan, nama_file, path_file } = req.body;
    const [updated] = await RuanganGallery.update(
      { id_ruangan, nama_file, path_file },
      { where: { id_gallery: id } }
    );
    if (updated) {
      const updatedRuanganGallery = await RuanganGallery.findByPk(id);
      res.json({
        message: "Ruangan gallery berhasil diperbarui",
        data: updatedRuanganGallery,
      });
    } else {
      res.status(404).json({ error: "Ruangan gallery tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE ruangan gallery
export const deleteRuanganGallery = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedRuanganGallery = await RuanganGallery.findByPk(id);
    if (!deletedRuanganGallery) {
      return res.status(404).json({ error: "Ruangan gallery tidak ditemukan" });
    }
    await deletedRuanganGallery.destroy();
    res.json({
      message: "Ruangan gallery berhasil dihapus",
      data: deletedRuanganGallery,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
