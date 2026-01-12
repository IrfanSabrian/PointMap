import { sequelize, Bangunan, LantaiGambar } from "../models/index.js";

async function fixImagePaths() {
  try {
    console.log("🔧 Fixing image paths in database...\n");

    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    // Fix Bangunan thumbnails
    console.log("📸 Updating building thumbnails...");
    const buildings = await Bangunan.findAll({
      where: {
        thumbnail: {
          [sequelize.Sequelize.Op.and]: [
            { [sequelize.Sequelize.Op.ne]: null },
            { [sequelize.Sequelize.Op.notLike]: "uploads/%" },
            { [sequelize.Sequelize.Op.notLike]: "http%" },
          ],
        },
      },
    });

    for (const building of buildings) {
      console.log(
        `  - Building ${building.id_bangunan}: ${building.thumbnail} → NULL (need re-upload)`
      );
      await building.update({ thumbnail: null });
    }
    console.log(`✅ Updated ${buildings.length} building thumbnails\n`);

    // Delete old LantaiGambar with wrong paths (they need to be re-uploaded anyway)
    console.log("🗺️  Deleting old floor plan records with wrong paths...");
    const deletedCount = await LantaiGambar.destroy({
      where: {
        path_file: {
          [sequelize.Sequelize.Op.and]: [
            { [sequelize.Sequelize.Op.ne]: null },
            { [sequelize.Sequelize.Op.notLike]: "uploads/%" },
            { [sequelize.Sequelize.Op.notLike]: "http%" },
          ],
        },
      },
    });
    console.log(`✅ Deleted ${deletedCount} old floor plan records\n`);

    console.log("✨ Done! All image paths have been reset.");
    console.log(
      "⚠️  You need to re-upload thumbnails and floor plans via dashboard."
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixImagePaths();
