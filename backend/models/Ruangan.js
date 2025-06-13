import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Ruangan = sequelize.define(
  "Ruangan",
  {
    nama_ruangan: DataTypes.STRING,
    id_lantai: DataTypes.INTEGER,
    id_gedung: DataTypes.INTEGER,
    id_prodi: DataTypes.INTEGER,
    fungsi: DataTypes.STRING,
    x_pixel: DataTypes.INTEGER,
    y_pixel: DataTypes.INTEGER,
    latitude: DataTypes.DECIMAL,
    longitude: DataTypes.DECIMAL,
  },
  {
    tableName: "ruangan",
    timestamps: false,
  }
);

export default Ruangan;
