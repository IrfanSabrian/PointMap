import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Prodi = sequelize.define(
  "Prodi",
  {
    id_prodi: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_jurusan: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nama_prodi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "prodi",
    timestamps: false,
  }
);

export default Prodi;
