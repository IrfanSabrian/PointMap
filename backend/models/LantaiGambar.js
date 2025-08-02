import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const LantaiGambar = sequelize.define(
  "LantaiGambar",
  {
    id_lantai_gambar: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_bangunan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nama_file: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path_file: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "lantai_gambar",
    timestamps: false,
  }
);

export default LantaiGambar;
