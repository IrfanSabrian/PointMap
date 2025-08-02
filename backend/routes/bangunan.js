import express from "express";
import {
  getAllBangunan,
  getBangunanById,
  updateBangunan,
  getBangunanGeoJSON,
} from "../controllers/bangunan.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllBangunan); // public
router.get("/geojson", getBangunanGeoJSON); // public - harus sebelum /:id
router.get("/:id", getBangunanById); // public
router.put("/:id", auth, updateBangunan); // admin - edit only

export default router;
