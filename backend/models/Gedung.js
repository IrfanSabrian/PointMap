import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Gedung = sequelize.define(
  "Gedung",
  {
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    jumlah_lantai: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jenis_gedung: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "gedung",
    timestamps: false,
  }
);

export default Gedung;
