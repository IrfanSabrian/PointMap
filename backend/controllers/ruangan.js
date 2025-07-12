import { Ruangan, Prodi, Jurusan } from "../models/index.js";

// GET semua ruangan
export const getAllRuangan = async (req, res) => {
  try {
    const ruangan = await Ruangan.findAll({
      include: [
        {
          model: Prodi,
          as: "prodi",
          include: [
            {
              model: Jurusan,
              as: "jurusan",
            },
          ],
        },
      ],
      order: [["nama_ruangan", "ASC"]],
    });
    res.json(ruangan);
  } catch (err) {
    console.error("Error in getAllRuangan:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET semua ruangan berdasarkan nomor lantai (query: ?lantai=nomor)
export const getRuanganByLantai = async (req, res) => {
  const { lantai } = req.query;
  try {
    const ruangan = await Ruangan.findAll({
      where: { nomor_lantai: lantai },
    });
    res.json(ruangan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ruangan berdasarkan id_bangunan dan dikelompokkan berdasarkan lantai
export const getRuanganByBangunan = async (req, res) => {
  try {
    const { id_bangunan } = req.params;
    const ruangan = await Ruangan.findAll({
      where: { id_bangunan: id_bangunan },
      include: [
        {
          model: Prodi,
          as: "prodi",
          include: [
            {
              model: Jurusan,
              as: "jurusan",
            },
          ],
        },
      ],
      order: [["nomor_lantai", "ASC"]],
    });

    // Kelompokkan ruangan berdasarkan lantai
    const ruanganByLantai = {};
    ruangan.forEach((r) => {
      const lantai = r.nomor_lantai;
      if (!ruanganByLantai[lantai]) {
        ruanganByLantai[lantai] = [];
      }

      // Tambahkan data prodi dan jurusan ke ruangan
      const ruanganData = r.toJSON();
      if (r.prodi) {
        ruanganData.nama_prodi = r.prodi.nama_prodi;
        ruanganData.nama_jurusan = r.prodi.jurusan
          ? r.prodi.jurusan.nama_jurusan
          : null;
      } else {
        ruanganData.nama_prodi = null;
        ruanganData.nama_jurusan = null;
      }

      ruanganByLantai[lantai].push(ruanganData);
    });

    res.json(ruanganByLantai);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE ruangan baru
export const addRuangan = async (req, res) => {
  try {
    const { nama_ruangan, nomor_lantai, id_bangunan, id_prodi } = req.body;
    const ruanganBaru = await Ruangan.create({
      nama_ruangan,
      nomor_lantai,
      id_bangunan,
      id_prodi,
    });
    res.status(201).json({
      message: "Ruangan berhasil ditambahkan",
      data: ruanganBaru,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE ruangan
export const updateRuangan = async (req, res) => {
  try {
    const id = req.params.id;
    const { nama_ruangan, nomor_lantai, id_bangunan, id_prodi } = req.body;
    const [updated] = await Ruangan.update(
      {
        nama_ruangan,
        nomor_lantai,
        id_bangunan,
        id_prodi,
      },
      { where: { id_ruangan: id } }
    );
    if (updated) {
      const updatedRuangan = await Ruangan.findByPk(id);
      res.json({
        message: "Ruangan berhasil diperbarui",
        data: updatedRuangan,
      });
    } else {
      res.status(404).json({ error: "Ruangan tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE ruangan
export const deleteRuangan = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedRuangan = await Ruangan.findByPk(id);
    if (!deletedRuangan) {
      return res.status(404).json({ error: "Ruangan tidak ditemukan" });
    }
    await deletedRuangan.destroy();
    res.json({
      message: "Ruangan berhasil dihapus",
      data: deletedRuangan,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
