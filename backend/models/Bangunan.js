import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Bangunan = sequelize.define(
  "Bangunan",
  {
    id_bangunan: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nama: DataTypes.STRING,
    interaksi: DataTypes.STRING,
    lantai: DataTypes.INTEGER,
    geometri: DataTypes.TEXT,
  },
  {
    tableName: "bangunan",
    timestamps: false,
  }
);

export default Bangunan;
