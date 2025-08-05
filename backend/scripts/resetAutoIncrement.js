import sequelize from "../config/db.js";

async function resetAutoIncrement() {
  try {
    console.log("🔄 Memulai reset auto-increment...");

    // Reset auto-increment untuk tabel ruangan
    console.log("📋 Mereset tabel ruangan...");
    await sequelize.query("ALTER TABLE ruangan AUTO_INCREMENT = 1");

    // Reset auto-increment untuk tabel ruangan_gallery
    console.log("🖼️ Mereset tabel ruangan_gallery...");
    await sequelize.query("ALTER TABLE ruangan_gallery AUTO_INCREMENT = 1");

    // Reset auto-increment untuk tabel lantai_gambar
    console.log("🏢 Mereset tabel lantai_gambar...");
    await sequelize.query("ALTER TABLE lantai_gambar AUTO_INCREMENT = 1");

    // Reorder ID untuk tabel ruangan
    console.log("🔄 Mengatur ulang ID tabel ruangan...");
    await sequelize.query(`
      SET @rank = 0;
      UPDATE ruangan SET id_ruangan = (@rank := @rank + 1) ORDER BY id_ruangan;
      ALTER TABLE ruangan AUTO_INCREMENT = (SELECT MAX(id_ruangan) + 1 FROM ruangan);
    `);

    // Reorder ID untuk tabel ruangan_gallery
    console.log("🔄 Mengatur ulang ID tabel ruangan_gallery...");
    await sequelize.query(`
      SET @rank = 0;
      UPDATE ruangan_gallery SET id_gallery = (@rank := @rank + 1) ORDER BY id_gallery;
      ALTER TABLE ruangan_gallery AUTO_INCREMENT = (SELECT MAX(id_gallery) + 1 FROM ruangan_gallery);
    `);

    // Reorder ID untuk tabel lantai_gambar
    console.log("🔄 Mengatur ulang ID tabel lantai_gambar...");
    await sequelize.query(`
      SET @rank = 0;
      UPDATE lantai_gambar SET id_lantai_gambar = (@rank := @rank + 1) ORDER BY id_lantai_gambar;
      ALTER TABLE lantai_gambar AUTO_INCREMENT = (SELECT MAX(id_lantai_gambar) + 1 FROM lantai_gambar);
    `);

    console.log("✅ Auto-increment berhasil direset dan ID diatur berurutan!");

    // Tampilkan status setelah reset
    const [ruanganResult] = await sequelize.query(
      "SHOW TABLE STATUS LIKE 'ruangan'"
    );
    const [galleryResult] = await sequelize.query(
      "SHOW TABLE STATUS LIKE 'ruangan_gallery'"
    );
    const [lantaiResult] = await sequelize.query(
      "SHOW TABLE STATUS LIKE 'lantai_gambar'"
    );

    console.log("\n📊 Status Auto-Increment:");
    console.log(
      `- Tabel ruangan: ${ruanganResult[0].Auto_increment} (${ruanganResult[0].Rows} rows)`
    );
    console.log(
      `- Tabel ruangan_gallery: ${galleryResult[0].Auto_increment} (${galleryResult[0].Rows} rows)`
    );
    console.log(
      `- Tabel lantai_gambar: ${lantaiResult[0].Auto_increment} (${lantaiResult[0].Rows} rows)`
    );
  } catch (error) {
    console.error("❌ Error saat reset auto-increment:", error);
  } finally {
    await sequelize.close();
    console.log("🔌 Koneksi database ditutup");
  }
}

// Jalankan script
resetAutoIncrement();
