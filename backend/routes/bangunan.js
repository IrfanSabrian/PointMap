import express from "express";
import {
  getAllBangunan,
  getBangunanById,
  updateBangunan,
  uploadThumbnail,
  getBangunanGeoJSON,
} from "../controllers/bangunan.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getAllBangunan); // public
router.get("/geojson", getBangunanGeoJSON); // public - harus sebelum /:id
router.get("/:id", getBangunanById); // public
router.put("/:id", auth, updateBangunan); // admin - edit only
router.post(
  "/:id/upload-thumbnail",
  auth,
  upload.single("thumbnail"),
  uploadThumbnail
); // admin - upload thumbnail

export default router;
