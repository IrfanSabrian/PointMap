import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Lantai = sequelize.define(
  "Lantai",
  {
    nama_lantai: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nomor_lantai: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_gedung: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "lantai",
    timestamps: false,
  }
);

export default Lantai;
