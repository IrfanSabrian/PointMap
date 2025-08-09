import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const commonOptions = {
  dialect: "mysql",
  logging: false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  dialectOptions: {
    ssl:
      process.env.NODE_ENV === "production"
        ? { require: true, rejectUnauthorized: false }
        : false,
  },
};

let sequelize;
if (process.env.MYSQL_URL) {
  // Pass URI directly as first arg; options as second arg
  sequelize = new Sequelize(process.env.MYSQL_URL, commonOptions);
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      ...commonOptions,
    }
  );
}

export default sequelize;
