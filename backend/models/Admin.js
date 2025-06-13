import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Admin = sequelize.define(
  "Admin",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "admin",
    timestamps: false,
  }
);

export default Admin;
