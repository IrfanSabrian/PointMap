import express from "express";
import {
  getLantaiByGedung,
  addLantai,
  updateLantai,
  deleteLantai,
} from "../controllers/lantai.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// GET semua lantai berdasarkan gedung (public)
router.get("/", getLantaiByGedung);

// Tambah lantai (admin)
router.post("/", verifyToken, addLantai);

// Edit lantai (admin)
router.put("/:id", verifyToken, updateLantai);

// Hapus lantai (admin)
router.delete("/:id", verifyToken, deleteLantai);

export default router;
