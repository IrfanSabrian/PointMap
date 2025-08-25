import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Titik = sequelize.define(
  "Titik",
  {
    id_titik: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    koordinat_x: {
      type: DataTypes.DECIMAL(15, 12),
      allowNull: false,
    },
    koordinat_y: {
      type: DataTypes.DECIMAL(15, 12),
      allowNull: false,
    },
    geometri: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "titik",
    timestamps: false,
  }
);

export default Titik;
