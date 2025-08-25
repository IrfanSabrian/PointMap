import express from "express";
const router = express.Router();
import {
  getAllTitik,
  getTitikById,
  createTitik,
  updateTitik,
  deleteTitik,
} from "../controllers/titik.js";

// GET /api/titik - Get all titik
router.get("/", getAllTitik);

// GET /api/titik/:id - Get titik by ID
router.get("/:id", getTitikById);

// POST /api/titik - Create new titik
router.post("/", createTitik);

// PUT /api/titik/:id - Update titik
router.put("/:id", updateTitik);

// DELETE /api/titik/:id - Delete titik
router.delete("/:id", deleteTitik);

export default router;
