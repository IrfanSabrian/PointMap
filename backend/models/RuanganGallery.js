import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const RuanganGallery = sequelize.define(
  "RuanganGallery",
  {
    id_gallery: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_ruangan: {
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
    tableName: "ruangan_gallery",
    timestamps: false,
  }
);

export default RuanganGallery;
