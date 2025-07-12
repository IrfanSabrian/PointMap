import express from "express";
import {
  getAllBangunan,
  getBangunanById,
  addBangunan,
  updateBangunan,
  deleteBangunan,
  getBangunanGeoJSON,
} from "../controllers/bangunan.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllBangunan); // public
router.get("/geojson", getBangunanGeoJSON); // public - harus sebelum /:id
router.get("/:id", getBangunanById); // public
router.post("/", auth, addBangunan); // admin
router.put("/:id", auth, updateBangunan); // admin
router.delete("/:id", auth, deleteBangunan); // admin

export default router;
