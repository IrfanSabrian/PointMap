import express from "express";
const router = express.Router();
import {
  getAllJalur,
  getJalurById,
  createJalur,
  updateJalur,
  deleteJalur,
} from "../controllers/jalur.js";

// GET /api/jalur - Get all jalur
router.get("/", getAllJalur);

// GET /api/jalur/:id - Get jalur by ID
router.get("/:id", getJalurById);

// POST /api/jalur - Create new jalur
router.post("/", createJalur);

// PUT /api/jalur/:id - Update jalur
router.put("/:id", updateJalur);

// DELETE /api/jalur/:id - Delete jalur
router.delete("/:id", deleteJalur);

export default router;
