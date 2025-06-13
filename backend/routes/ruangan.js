import express from "express";
import {
  getRuanganByLantai,
  addRuangan,
  updateRuangan,
  deleteRuangan,
} from "../controllers/ruangan.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getRuanganByLantai);

router.post("/", auth, addRuangan);
router.put("/:id", auth, updateRuangan);
router.delete("/:id", auth, deleteRuangan);

export default router;
