import express from "express";
import {
  getAllRuangan,
  getRuanganById,
  getRuanganByBangunan,
  getRuanganFor3DView,
  createRuangan,
  updateRuangan,
  deleteRuangan,
} from "../controllers/ruangan.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllRuangan);
router.get("/bangunan/:id_bangunan", getRuanganByBangunan); // public - harus sebelum /:id
router.get("/bangunan/:id_bangunan/3d", getRuanganFor3DView); // public - untuk tampilan 3D
router.get("/:id", getRuanganById);
router.post("/", auth, createRuangan); // admin - create new
router.put("/:id", auth, updateRuangan); // admin - edit only
router.delete("/:id", auth, deleteRuangan); // admin - delete only

export default router;
