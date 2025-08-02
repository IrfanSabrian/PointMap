import express from "express";
import {
  getAllRuanganGallery,
  getRuanganGalleryById,
  getRuanganGalleryByRuangan,
  uploadGallery,
  reorderGallery,
  deleteGallery,
} from "../controllers/ruanganGallery.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getAllRuanganGallery); // public
router.get("/ruangan/:ruanganId", getRuanganGalleryByRuangan); // public
router.get("/:id", getRuanganGalleryById); // public
router.post("/upload", auth, upload.array("gallery", 10), uploadGallery); // admin - upload gallery
router.put("/reorder", auth, reorderGallery); // admin - reorder gallery
router.delete("/:id", auth, deleteGallery); // admin - delete gallery

export default router;
