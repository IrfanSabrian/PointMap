import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const LogPengunjung = sequelize.define(
  "log_pengunjung",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_ruangan: { type: DataTypes.INTEGER, allowNull: false },
    jumlah_kunjungan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    last_visited: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "log_pengunjung",
    timestamps: false,
  }
);

export default LogPengunjung;
