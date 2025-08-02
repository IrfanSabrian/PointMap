import Ruangan from "../models/Ruangan.js";
import Bangunan from "../models/Bangunan.js";

// GET semua ruangan
export const getAllRuangan = async (req, res) => {
  try {
    const data = await Ruangan.findAll({
      include: [
        {
          model: Bangunan,
          as: "bangunan",
          attributes: ["id_bangunan", "nama"],
        },
      ],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ruangan berdasarkan ID
export const getRuanganById = async (req, res) => {
  try {
    const id = req.params.id;
    const ruangan = await Ruangan.findByPk(id, {
      include: [
        {
          model: Bangunan,
          as: "bangunan",
          attributes: ["id_bangunan", "nama"],
        },
      ],
    });
    if (!ruangan) {
      return res.status(404).json({ error: "Ruangan tidak ditemukan" });
    }
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
      order: [["nomor_lantai", "ASC"]],
    });

    // Kelompokkan ruangan berdasarkan lantai
    const ruanganByLantai = {};
    ruangan.forEach((r) => {
      const lantai = r.nomor_lantai;
      if (!ruanganByLantai[lantai]) {
        ruanganByLantai[lantai] = [];
      }

      // Data ruangan sudah lengkap dengan nama_jurusan dan nama_prodi
      const ruanganData = r.toJSON();
      ruanganByLantai[lantai].push(ruanganData);
    });

    res.json(ruanganByLantai);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE ruangan
export const updateRuangan = async (req, res) => {
  try {
    const id = req.params.id;
    const { nama_ruangan, nomor_lantai, jurusan, prodi } = req.body;

    const [updated] = await Ruangan.update(
      {
        nama_ruangan,
        nomor_lantai,
        nama_jurusan: jurusan,
        nama_prodi: prodi,
      },
      { where: { id_ruangan: id } }
    );

    if (updated) {
      const updatedRuangan = await Ruangan.findByPk(id, {
        include: [
          {
            model: Bangunan,
            as: "bangunan",
            attributes: ["id_bangunan", "nama"],
          },
        ],
      });
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
    const deleted = await Ruangan.destroy({
      where: { id_ruangan: id },
    });

    if (deleted) {
      res.json({ message: "Ruangan berhasil dihapus" });
    } else {
      res.status(404).json({ error: "Ruangan tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
