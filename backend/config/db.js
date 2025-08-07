import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

// Use MySQL URL if available, otherwise use individual parameters
const dbConfig = process.env.MYSQL_URL 
  ? {
      url: process.env.MYSQL_URL,
      dialect: "mysql",
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    }
  : {
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: "mysql",
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    };

const sequelize = new Sequelize(dbConfig);

export default sequelize;
