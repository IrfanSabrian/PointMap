import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Ruangan = sequelize.define(
  "Ruangan",
  {
    id_ruangan: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nama_ruangan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nomor_lantai: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_bangunan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nama_jurusan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_prodi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "ruangan",
    timestamps: false,
  }
);

export default Ruangan;
