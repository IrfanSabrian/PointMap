import express from "express";
import {
  getAllRuangan,
  getRuanganByLantai,
  getRuanganByBangunan,
  updateRuangan,
} from "../controllers/ruangan.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllRuangan);
router.get("/lantai", getRuanganByLantai);
router.get("/bangunan/:id_bangunan", getRuanganByBangunan);
router.put("/:id", auth, updateRuangan); // admin - edit only

export default router;
