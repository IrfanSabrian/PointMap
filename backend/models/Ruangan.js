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
    id_lantai: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_bangunan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_prodi: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deskripsi: {
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
