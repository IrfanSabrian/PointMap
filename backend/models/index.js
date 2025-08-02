import sequelize from "../config/db.js";
import Admin from "./Admin.js";
import Bangunan from "./Bangunan.js";
import Ruangan from "./Ruangan.js";
import LantaiGambar from "./LantaiGambar.js";
import RuanganGallery from "./RuanganGallery.js";

// Definisikan relasi
Ruangan.belongsTo(Bangunan, { foreignKey: "id_bangunan", as: "bangunan" });
Bangunan.hasMany(Ruangan, { foreignKey: "id_bangunan", as: "ruangan" });

// Relasi untuk lantai gambar
LantaiGambar.belongsTo(Bangunan, { foreignKey: "id_bangunan", as: "bangunan" });
Bangunan.hasMany(LantaiGambar, {
  foreignKey: "id_bangunan",
  as: "lantai_gambar",
});

// Relasi untuk ruangan gallery
RuanganGallery.belongsTo(Ruangan, { foreignKey: "id_ruangan", as: "ruangan" });
Ruangan.hasMany(RuanganGallery, { foreignKey: "id_ruangan", as: "gallery" });

export { sequelize, Admin, Bangunan, Ruangan, LantaiGambar, RuanganGallery };
