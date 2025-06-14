import LogPengunjung from "../models/Log.js";
import { Op } from "sequelize";

export const getStatistikKunjungan = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Hari ini
    const totalToday = await LogPengunjung.sum("jumlah_kunjungan", {
      where: {
        last_visited: {
          [Op.gte]: today,
        },
      },
    });
    // Minggu ini
    const totalWeek = await LogPengunjung.sum("jumlah_kunjungan", {
      where: {
        last_visited: {
          [Op.gte]: weekStart,
        },
      },
    });
    // Bulan ini
    const totalMonth = await LogPengunjung.sum("jumlah_kunjungan", {
      where: {
        last_visited: {
          [Op.gte]: monthStart,
        },
      },
    });
    // Total semua
    const totalAll = await LogPengunjung.sum("jumlah_kunjungan");

    res.json({
      today: totalToday || 0,
      week: totalWeek || 0,
      month: totalMonth || 0,
      total: totalAll || 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil statistik kunjungan" });
  }
};
