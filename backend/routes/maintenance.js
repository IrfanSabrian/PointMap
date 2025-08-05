import express from "express";
import {
  resetAutoIncrement,
  getAutoIncrementStatus,
} from "../controllers/maintenance.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// Route untuk melihat status auto-increment
router.get("/auto-increment-status", auth, getAutoIncrementStatus);

// Route untuk mereset auto-increment
router.post("/reset-auto-increment", auth, resetAutoIncrement);

export default router;
