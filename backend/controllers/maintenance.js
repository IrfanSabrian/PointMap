import sequelize from "../config/db.js";

// Fungsi untuk mereset auto-increment dan mengatur ID berurutan
export const resetAutoIncrement = async (req, res) => {
  try {
    // Reset auto-increment untuk tabel ruangan
    await sequelize.query("ALTER TABLE ruangan AUTO_INCREMENT = 1");

    // Reset auto-increment untuk tabel ruangan_gallery
    await sequelize.query("ALTER TABLE ruangan_gallery AUTO_INCREMENT = 1");

    // Reset auto-increment untuk tabel lantai_gambar
    await sequelize.query("ALTER TABLE lantai_gambar AUTO_INCREMENT = 1");

    // Reorder ID untuk tabel ruangan
    await sequelize.query(`
      SET @rank = 0;
      UPDATE ruangan SET id_ruangan = (@rank := @rank + 1) ORDER BY id_ruangan;
      ALTER TABLE ruangan AUTO_INCREMENT = (SELECT MAX(id_ruangan) + 1 FROM ruangan);
    `);

    // Reorder ID untuk tabel ruangan_gallery
    await sequelize.query(`
      SET @rank = 0;
      UPDATE ruangan_gallery SET id_gallery = (@rank := @rank + 1) ORDER BY id_gallery;
      ALTER TABLE ruangan_gallery AUTO_INCREMENT = (SELECT MAX(id_gallery) + 1 FROM ruangan_gallery);
    `);

    // Reorder ID untuk tabel lantai_gambar
    await sequelize.query(`
      SET @rank = 0;
      UPDATE lantai_gambar SET id_lantai_gambar = (@rank := @rank + 1) ORDER BY id_lantai_gambar;
      ALTER TABLE lantai_gambar AUTO_INCREMENT = (SELECT MAX(id_lantai_gambar) + 1 FROM lantai_gambar);
    `);

    res.json({
      message: "Auto-increment berhasil direset dan ID diatur berurutan",
      tables: ["ruangan", "ruangan_gallery", "lantai_gambar"],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fungsi untuk melihat status auto-increment
export const getAutoIncrementStatus = async (req, res) => {
  try {
    const [ruanganResult] = await sequelize.query(
      "SHOW TABLE STATUS LIKE 'ruangan'"
    );
    const [galleryResult] = await sequelize.query(
      "SHOW TABLE STATUS LIKE 'ruangan_gallery'"
    );
    const [lantaiResult] = await sequelize.query(
      "SHOW TABLE STATUS LIKE 'lantai_gambar'"
    );

    res.json({
      ruangan: {
        auto_increment: ruanganResult[0].Auto_increment,
        rows: ruanganResult[0].Rows,
      },
      ruangan_gallery: {
        auto_increment: galleryResult[0].Auto_increment,
        rows: galleryResult[0].Rows,
      },
      lantai_gambar: {
        auto_increment: lantaiResult[0].Auto_increment,
        rows: lantaiResult[0].Rows,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
