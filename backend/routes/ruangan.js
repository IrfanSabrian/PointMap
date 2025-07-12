import express from "express";
import {
  getAllRuangan,
  getRuanganByLantai,
  getRuanganByBangunan,
  addRuangan,
  updateRuangan,
  deleteRuangan,
} from "../controllers/ruangan.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllRuangan);
router.get("/lantai", getRuanganByLantai);
router.get("/bangunan/:id_bangunan", getRuanganByBangunan);
router.post("/", auth, addRuangan);
router.put("/:id", auth, updateRuangan);
router.delete("/:id", auth, deleteRuangan);

export default router;
