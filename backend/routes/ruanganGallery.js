import express from "express";
import {
  getAllRuanganGallery,
  getRuanganGalleryById,
  getRuanganGalleryByRuangan,
  addRuanganGallery,
  updateRuanganGallery,
  deleteRuanganGallery,
} from "../controllers/ruanganGallery.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllRuanganGallery); // public
router.get("/ruangan/:id_ruangan", getRuanganGalleryByRuangan); // public
router.get("/:id", getRuanganGalleryById); // public
router.post("/", auth, addRuanganGallery); // admin
router.put("/:id", auth, updateRuanganGallery); // admin
router.delete("/:id", auth, deleteRuanganGallery); // admin

export default router;
