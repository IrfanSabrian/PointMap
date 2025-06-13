import express from "express";
import {
  getRuanganByLantai,
  addRuangan,
  updateRuangan,
  deleteRuangan,
} from "../controllers/ruangan.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// GET semua ruangan berdasarkan lantai (public)
router.get("/", getRuanganByLantai);

// Tambah ruangan (admin)
router.post("/", verifyToken, addRuangan);

// Edit ruangan (admin)
router.put("/:id", verifyToken, updateRuangan);

// Hapus ruangan (admin)
router.delete("/:id", verifyToken, deleteRuangan);

export default router;
