import express from "express";
import {
  getAllBangunan,
  getBangunanById,
  createBangunan,
  updateBangunan,
  deleteBangunan,
  uploadThumbnail,
  getBangunanGeoJSON,
} from "../controllers/bangunan.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getAllBangunan); // public
router.get("/geojson", getBangunanGeoJSON); // public - harus sebelum /:id
router.get("/:id", getBangunanById); // public
router.post("/", auth, createBangunan); // admin - create
router.put("/:id", auth, updateBangunan); // admin - edit only
router.delete("/:id", auth, deleteBangunan); // admin - delete
router.post(
  "/:id/upload-thumbnail",
  auth,
  upload.single("thumbnail"),
  uploadThumbnail
); // admin - upload thumbnail

export default router;
