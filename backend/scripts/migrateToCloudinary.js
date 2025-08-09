import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cloudinary from "../config/cloudinary.js";
import {
  sequelize,
  Bangunan,
  LantaiGambar,
  Ruangan,
  RuanganGallery,
} from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_ROOT = path.resolve(__dirname, "../../frontend/public");

function isUrl(str) {
  return /^https?:\/\//i.test(str || "");
}

function buildLocalPath(dbPath) {
  return path.join(PUBLIC_ROOT, dbPath);
}

function ensureFileExists(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function getUploadOptionsFromPath(dbPath) {
  // dbPath like: img/{id}/thumbnail.jpg or img/{id}/lantai/LtN.svg or img/{id}/ruangan/{rid}/galleryX.jpg
  const normalized = dbPath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  // remove leading 'img'
  if (parts[0] !== "img") {
    return null;
  }
  const folder = parts.slice(0, parts.length - 1).join("/");
  const filename = parts[parts.length - 1];
  const base = filename.replace(/\.[^.]+$/, "");
  const ext = (filename.split(".").pop() || "").toLowerCase();
  const format = ext === "svg" ? "svg" : ext || undefined;
  return {
    folder,
    public_id: base,
    format,
  };
}

async function uploadFileIfNeeded(localPath, dbPath) {
  const opts = getUploadOptionsFromPath(dbPath);
  if (!opts) return null;
  const { folder, public_id, format } = opts;
  const uploadOptions = {
    folder,
    public_id,
    overwrite: true,
    resource_type: "image",
  };
  if (format) uploadOptions.format = format;
  const res = await cloudinary.uploader.upload(localPath, uploadOptions);
  return res.secure_url;
}

async function migrateThumbnails() {
  const rows = await Bangunan.findAll();
  let updated = 0;
  for (const row of rows) {
    const p = row.thumbnail;
    if (!p || isUrl(p)) continue;
    const local = buildLocalPath(p);
    if (!ensureFileExists(local)) continue;
    try {
      const url = await uploadFileIfNeeded(local, p);
      if (url) {
        await Bangunan.update(
          { thumbnail: url },
          { where: { id_bangunan: row.id_bangunan } }
        );
        updated++;
      }
    } catch (e) {
      console.error(
        "Failed upload thumbnail for bangunan",
        row.id_bangunan,
        e.message
      );
    }
  }
  return updated;
}

async function migrateLantaiGambar() {
  const rows = await LantaiGambar.findAll();
  let updated = 0;
  for (const row of rows) {
    const p = row.path_file;
    if (!p || isUrl(p)) continue;
    const local = buildLocalPath(p);
    if (!ensureFileExists(local)) continue;
    try {
      const url = await uploadFileIfNeeded(local, p);
      if (url) {
        await LantaiGambar.update(
          { path_file: url },
          { where: { id_lantai_gambar: row.id_lantai_gambar } }
        );
        updated++;
      }
    } catch (e) {
      console.error(
        "Failed upload lantai_gambar",
        row.id_lantai_gambar,
        e.message
      );
    }
  }
  return updated;
}

async function migrateRuanganGallery() {
  const rows = await RuanganGallery.findAll({
    include: [{ model: Ruangan, as: "ruangan" }],
  });
  let updated = 0;
  for (const row of rows) {
    const p = row.path_file;
    if (!p || isUrl(p)) continue;
    const local = buildLocalPath(p);
    if (!ensureFileExists(local)) continue;
    try {
      const url = await uploadFileIfNeeded(local, p);
      if (url) {
        await RuanganGallery.update(
          { path_file: url },
          { where: { id_gallery: row.id_gallery } }
        );
        updated++;
      }
    } catch (e) {
      console.error("Failed upload ruangan_gallery", row.id_gallery, e.message);
    }
  }
  return updated;
}

async function main() {
  console.log("Starting Cloudinary migration...");
  try {
    await sequelize.authenticate();
  } catch (e) {
    console.error("DB connect failed:", e.message);
    process.exit(1);
  }

  const thumb = await migrateThumbnails();
  const lantai = await migrateLantaiGambar();
  const gallery = await migrateRuanganGallery();

  console.log("Migration completed:");
  console.log("- Thumbnails updated:", thumb);
  console.log("- LantaiGambar updated:", lantai);
  console.log("- RuanganGallery updated:", gallery);
  process.exit(0);
}

main();
