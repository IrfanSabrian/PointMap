import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Jalur = sequelize.define(
  "Jalur",
  {
    id_jalur: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    mode: {
      type: DataTypes.ENUM("both", "pejalan"),
      defaultValue: "both",
    },
    arah: {
      type: DataTypes.ENUM("oneway", "twoway"),
      defaultValue: "twoway",
    },
    panjang: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
    },
    waktu_kaki: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
    },
    waktu_kendara: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
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
    tableName: "jalur",
    timestamps: false,
  }
);

export default Jalur;
