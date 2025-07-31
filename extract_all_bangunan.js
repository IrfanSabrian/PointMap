const fs = require("fs");

// Baca file GeoJSON
const geojsonPath = "./frontend/public/geojson/Polnep WGS_1984.geojson";
const geojsonData = JSON.parse(fs.readFileSync(geojsonPath, "utf8"));

// Filter hanya bangunan (semua, termasuk yang tidak ada nama)
const bangunanFeatures = geojsonData.features.filter(
  (feature) => feature.properties.kategori === "Bangunan"
);

// Generate SQL INSERT statements
let sqlStatements = [];

// Reset AUTO_INCREMENT dan hapus data lama
sqlStatements.push("-- Reset tabel bangunan");
sqlStatements.push("DELETE FROM bangunan;");
sqlStatements.push("ALTER TABLE bangunan AUTO_INCREMENT = 1;");
sqlStatements.push("");

// Insert data baru
sqlStatements.push("-- Insert data bangunan dari GeoJSON (semua bangunan)");
sqlStatements.push(
  "INSERT INTO bangunan (id_bangunan, nama, interaksi, lantai, geometri) VALUES"
);

bangunanFeatures.forEach((feature, index) => {
  const id = feature.id || index + 1;
  const nama = feature.properties.nama || null;
  const interaksi = feature.properties.subtipe || null;
  const lantai = feature.properties.lantai || 0;
  const geometri = JSON.stringify(feature.geometry);

  const values = `(${id}, ${nama ? `'${nama.replace(/'/g, "''")}'` : "NULL"}, ${
    interaksi ? `'${interaksi.replace(/'/g, "''")}'` : "NULL"
  }, ${lantai}, '${geometri}')`;

  if (index === bangunanFeatures.length - 1) {
    sqlStatements.push(values + ";");
  } else {
    sqlStatements.push(values + ",");
  }
});

// Tulis ke file
const outputPath = "./all_bangunan_data.sql";
fs.writeFileSync(outputPath, sqlStatements.join("\n"));

console.log(
  `Berhasil mengekstrak ${bangunanFeatures.length} bangunan dari GeoJSON`
);
console.log(`Data telah disimpan ke: ${outputPath}`);

// Tampilkan daftar bangunan yang ditemukan
console.log("\nDaftar bangunan yang ditemukan:");
bangunanFeatures.forEach((feature, index) => {
  const nama = feature.properties.nama || "Tanpa nama";
  const id = feature.id || index + 1;
  console.log(`${index + 1}. ${nama} (ID: ${id})`);
});

// Hitung statistik
const denganNama = bangunanFeatures.filter(
  (f) => f.properties.nama && f.properties.nama.trim() !== ""
).length;
const tanpaNama = bangunanFeatures.length - denganNama;

console.log(`\nStatistik:`);
console.log(`- Total bangunan: ${bangunanFeatures.length}`);
console.log(`- Dengan nama: ${denganNama}`);
console.log(`- Tanpa nama: ${tanpaNama}`);
