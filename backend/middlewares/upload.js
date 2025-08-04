import multer from "multer";
import path from "path";
import fs from "fs";

// Pastikan folder uploads ada
const uploadsDir = "uploads/";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Konfigurasi storage untuk multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Simpan file sementara di folder uploads
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate nama file unik dengan timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Filter untuk validasi file
const fileFilter = (req, file, cb) => {
  // Cek tipe file - terima SVG dan gambar
  if (file.mimetype.startsWith("image/") || file.mimetype === "image/svg+xml") {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Hanya file gambar (JPG, PNG, GIF, WebP, SVG) yang diperbolehkan!"
      ),
      false
    );
  }
};

// Konfigurasi multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit untuk SVG
  },
});

export default upload;
