import sequelize from "./config/db.js";
import fs from "fs";

async function runMigration() {
  try {
    console.log("Running migration: add_kampus_column.sql");

    const sql = fs.readFileSync("./migrations/add_kampus_column.sql", "utf8");

    // Split by semicolon and filter out empty statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await sequelize.query(statement);
      }
    }

    console.log("✓ Migration completed successfully!");

    // Verify the changes
    const [results] = await sequelize.query(
      "SELECT id_bangunan, nama, kategori_kampus FROM bangunan LIMIT 5"
    );
    console.log("\nVerification - Sample data:");
    console.table(results);

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
