import bcrypt from "bcrypt";

const passwordPlain = ""; // ganti dengan password admin yang kamu mau
const saltRounds = 10;

bcrypt.hash(passwordPlain, saltRounds, (err, hash) => {
  if (err) {
    console.error("Gagal hash password:", err);
    process.exit(1);
  }
  console.log("Password yang sudah di-hash:\n", hash);
});

// cara jalankan, tulis node backend/tools/hash_password.js di terminal