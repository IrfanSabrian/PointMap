import { sequelize, Bangunan, LantaiGambar } from "../models/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function restoreFromPublic() {
  try {
    console.log("🔧 Restoring database from frontend/public/img...\n");

    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    const publicImgDir = path.resolve(__dirname, "../../frontend/public/img");

    // Get all subdirectories (building IDs)
    const dirs = fs.readdirSync(publicImgDir).filter((f) => {
      return (
        fs.statSync(path.join(publicImgDir, f)).isDirectory() &&
        !isNaN(parseInt(f))
      );
    });

    for (const dir of dirs) {
      const id = parseInt(dir);
      console.log(`Processing Building ID: ${id}`);

      const buildingDir = path.join(publicImgDir, dir);

      // 1. Check Thumbnail
      const thumbnailPath = path.join(buildingDir, "thumbnail.jpg");
      if (fs.existsSync(thumbnailPath)) {
        const dbPath = `/img/${id}/thumbnail.jpg`;
        console.log(`  - Found thumbnail: ${dbPath}`);

        // Update Bangunan
        const [updated] = await Bangunan.update(
          { thumbnail: dbPath },
          { where: { id_bangunan: id } }
        );
        if (updated) console.log(`    ✅ Updated Bangunan thumbnail`);
        else console.log(`    ⚠️  Building not found in DB`);
      }

      // 2. Check Floor Plans
      const lantaiDir = path.join(buildingDir, "lantai");
      if (fs.existsSync(lantaiDir)) {
        const files = fs
          .readdirSync(lantaiDir)
          .filter(
            (f) =>
              f.endsWith(".svg") || f.endsWith(".png") || f.endsWith(".jpg")
          );

        for (const file of files) {
          // Parse floor number (e.g. Lt1.svg -> 1)
          const match = file.match(/Lt(\d+)/i);
          // Convention: file name IS correct in DB "nama_file" usually

          const dbPath = `/img/${id}/lantai/${file}`;

          // Upsert LantaiGambar
          // Needs unique constraint on id_bangunan + nama_file technically
          // Check if exists
          const existing = await LantaiGambar.findOne({
            where: { id_bangunan: id, nama_file: file },
          });

          if (existing) {
            await existing.update({ path_file: dbPath });
            console.log(`    ✅ Updated floor plan: ${file} -> ${dbPath}`);
          } else {
            await LantaiGambar.create({
              id_bangunan: id,
              nama_file: file,
              path_file: dbPath,
            });
            console.log(`    ✅ Inserted floor plan: ${file} -> ${dbPath}`);
          }
        }
      }
    }

    console.log("\n✨ Restore complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

restoreFromPublic();
