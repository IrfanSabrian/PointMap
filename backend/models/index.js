import sequelize from "../config/db.js";
import Admin from "./Admin.js";
import Bangunan from "./Bangunan.js";
import Jurusan from "./Jurusan.js";
import Prodi from "./Prodi.js";
import Ruangan from "./Ruangan.js";

// Definisikan relasi
Prodi.belongsTo(Jurusan, { foreignKey: "id_jurusan", as: "jurusan" });
Jurusan.hasMany(Prodi, { foreignKey: "id_jurusan", as: "prodi" });

Ruangan.belongsTo(Prodi, { foreignKey: "id_prodi", as: "prodi" });
Prodi.hasMany(Ruangan, { foreignKey: "id_prodi", as: "ruangan" });

Ruangan.belongsTo(Bangunan, { foreignKey: "id_bangunan", as: "bangunan" });
Bangunan.hasMany(Ruangan, { foreignKey: "id_bangunan", as: "ruangan" });

export { sequelize, Admin, Bangunan, Jurusan, Prodi, Ruangan };
