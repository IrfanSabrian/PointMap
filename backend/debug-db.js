// Debug Database Connection
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const debugDatabase = async () => {
  console.log("🔍 Railway Database Debug Tool");
  console.log("=" * 50);
  
  // Check environment variables
  console.log("\n📋 Environment Variables:");
  console.log("DB_HOST:", process.env.DB_HOST);
  console.log("DB_PORT:", process.env.DB_PORT);
  console.log("DB_USER:", process.env.DB_USER);
  console.log("DB_NAME:", process.env.DB_NAME);
  console.log("DB_PASS:", process.env.DB_PASS ? "***SET***" : "❌ NOT SET");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  
  // Check if all required variables are set
  const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log("\n❌ Missing Environment Variables:");
    missingVars.forEach(varName => console.log(`- ${varName}`));
    return;
  }
  
  console.log("\n✅ All required environment variables are set");
  
  // Test MySQL connection
  console.log("\n🔄 Testing MySQL Connection...");
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ssl: process.env.NODE_ENV === "production" ? {
        rejectUnauthorized: false
      } : false,
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000
    });
    
    console.log("✅ MySQL connection successful!");
    
    // Test query
    const [rows] = await connection.execute("SELECT 1 as test, NOW() as current_time");
    console.log("✅ Database query test successful:", rows);
    
    // Test database info
    const [dbInfo] = await connection.execute("SELECT DATABASE() as current_db, USER() as current_user");
    console.log("✅ Database info:", dbInfo);
    
    await connection.end();
    
  } catch (error) {
    console.error("❌ MySQL connection failed:");
    console.error("Error:", error.message);
    console.error("Code:", error.code);
    console.error("Errno:", error.errno);
    console.error("SQL State:", error.sqlState);
    
    // Provide specific troubleshooting tips
    console.log("\n💡 Troubleshooting Tips:");
    
    if (error.code === "ECONNREFUSED") {
      console.log("- Connection refused: Database service might not be running");
      console.log("- Check if MySQL service exists in Railway project");
      console.log("- Verify DB_HOST and DB_PORT are correct");
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("- Access denied: Check DB_USER and DB_PASS");
      console.log("- Verify database credentials in Railway");
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.log("- Database doesn't exist: Check DB_NAME");
      console.log("- Create database if it doesn't exist");
    } else if (error.code === "ENOTFOUND") {
      console.log("- Host not found: Check DB_HOST");
      console.log("- Use 'mysql.railway.internal' for internal connection");
    } else if (error.code === "ETIMEDOUT") {
      console.log("- Connection timeout: Check network connectivity");
      console.log("- Verify database service is accessible");
    }
  }
  
  // Test Sequelize connection
  console.log("\n🔄 Testing Sequelize Connection...");
  
  try {
    const { Sequelize } = await import("sequelize");
    
    const sequelize = new Sequelize({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      dialect: "mysql",
      logging: false,
      dialectOptions: {
        ssl: process.env.NODE_ENV === "production" ? {
          require: true,
          rejectUnauthorized: false
        } : false,
        connectTimeout: 10000,
        acquireTimeout: 10000,
        timeout: 10000
      }
    });

    await sequelize.authenticate();
    console.log("✅ Sequelize connection successful!");
    
    await sequelize.close();
    
  } catch (error) {
    console.error("❌ Sequelize connection failed:");
    console.error("Error:", error.message);
  }
  
  console.log("\n" + "=" * 50);
  console.log("🔍 Debug complete!");
};

debugDatabase();
