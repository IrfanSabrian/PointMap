import express from "express";
import {
  getAllRuangan,
  getRuanganById,
  getRuanganByBangunan,
  updateRuangan,
  deleteRuangan,
} from "../controllers/ruangan.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllRuangan);
router.get("/bangunan/:id_bangunan", getRuanganByBangunan); // public - harus sebelum /:id
router.get("/:id", getRuanganById);
router.put("/:id", auth, updateRuangan); // admin - edit only
router.delete("/:id", auth, deleteRuangan); // admin - delete only

export default router;
