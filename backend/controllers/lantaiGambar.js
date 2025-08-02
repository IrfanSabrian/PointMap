import { LantaiGambar, Bangunan } from "../models/index.js";

// GET semua lantai gambar
export const getAllLantaiGambar = async (req, res) => {
  try {
    const data = await LantaiGambar.findAll({
      include: [
        {
          model: Bangunan,
          as: "bangunan",
          attributes: ["id_bangunan", "nama"],
        },
      ],
      order: [
        ["id_bangunan", "ASC"],
        ["nama_file", "ASC"],
      ],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET lantai gambar berdasarkan ID
export const getLantaiGambarById = async (req, res) => {
  try {
    const id = req.params.id;
    const lantaiGambar = await LantaiGambar.findByPk(id, {
      include: [
        {
          model: Bangunan,
          as: "bangunan",
          attributes: ["id_bangunan", "nama"],
        },
      ],
    });
    if (!lantaiGambar) {
      return res.status(404).json({ error: "Lantai gambar tidak ditemukan" });
    }
    res.json(lantaiGambar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET lantai gambar berdasarkan ID bangunan
export const getLantaiGambarByBangunan = async (req, res) => {
  try {
    const { id_bangunan } = req.params;
    const lantaiGambar = await LantaiGambar.findAll({
      where: { id_bangunan: id_bangunan },
      include: [
        {
          model: Bangunan,
          as: "bangunan",
          attributes: ["id_bangunan", "nama"],
        },
      ],
      order: [["nama_file", "ASC"]],
    });
    res.json(lantaiGambar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE lantai gambar baru
export const addLantaiGambar = async (req, res) => {
  try {
    const { id_bangunan, nama_file, path_file } = req.body;
    const baru = await LantaiGambar.create({
      id_bangunan,
      nama_file,
      path_file,
    });
    res.status(201).json({
      message: "Lantai gambar berhasil ditambahkan",
      data: baru,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE lantai gambar
export const updateLantaiGambar = async (req, res) => {
  try {
    const id = req.params.id;
    const { id_bangunan, nama_file, path_file } = req.body;
    const [updated] = await LantaiGambar.update(
      { id_bangunan, nama_file, path_file },
      { where: { id_lantai_gambar: id } }
    );
    if (updated) {
      const updatedLantaiGambar = await LantaiGambar.findByPk(id);
      res.json({
        message: "Lantai gambar berhasil diperbarui",
        data: updatedLantaiGambar,
      });
    } else {
      res.status(404).json({ error: "Lantai gambar tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE lantai gambar
export const deleteLantaiGambar = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedLantaiGambar = await LantaiGambar.findByPk(id);
    if (!deletedLantaiGambar) {
      return res.status(404).json({ error: "Lantai gambar tidak ditemukan" });
    }
    await deletedLantaiGambar.destroy();
    res.json({
      message: "Lantai gambar berhasil dihapus",
      data: deletedLantaiGambar,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
