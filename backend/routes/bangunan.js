import express from "express";
import {
  getAllBangunan,
  addBangunan,
  updateBangunan,
  deleteBangunan,
  getBangunanGeoJSON,
} from "../controllers/bangunan.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllBangunan); // public
router.post("/", auth, addBangunan); // admin
router.put("/:id", auth, updateBangunan); // admin
router.delete("/:id", auth, deleteBangunan); // admin
router.get("/geojson", getBangunanGeoJSON);

export default router;
