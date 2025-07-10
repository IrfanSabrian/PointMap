import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Jurusan = sequelize.define(
  "Jurusan",
  {
    id_jurusan: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nama_jurusan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "jurusan",
    timestamps: false,
  }
);

export default Jurusan;
