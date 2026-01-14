import sequelize from "./config/db.js";

async function checkDatabase() {
  try {
    console.log("Checking database schema...\n");

    // Check if kategori_kampus column exists
    const [columns] = await sequelize.query("SHOW COLUMNS FROM bangunan");

    console.log("Current bangunan table columns:");
    console.table(columns);

    const hasKampusColumn = columns.some(
      (col) => col.Field === "kategori_kampus"
    );

    if (!hasKampusColumn) {
      console.log(
        "\n❌ kategori_kampus column NOT found. Running migration..."
      );

      await sequelize.query(`
        ALTER TABLE bangunan 
        ADD COLUMN kategori_kampus VARCHAR(100) DEFAULT 'Politeknik Negeri Pontianak'
      `);

      await sequelize.query(`
        UPDATE bangunan 
        SET kategori_kampus = 'Politeknik Negeri Pontianak' 
        WHERE kategori_kampus IS NULL
      `);

      await sequelize.query(`
        CREATE INDEX idx_bangunan_kampus ON bangunan(kategori_kampus)
      `);

      console.log("✓ Migration completed!");
    } else {
      console.log("\n✓ kategori_kampus column already exists!");
    }

    // Show sample data
    const [results] = await sequelize.query(
      "SELECT id_bangunan, nama, kategori_kampus FROM bangunan LIMIT 5"
    );
    console.log("\nSample data:");
    console.table(results);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkDatabase();
