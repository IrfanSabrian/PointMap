import express from "express";
import { loginAdmin, verifyToken, logout } from "../controllers/auth.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.post("/login", loginAdmin);

// Protected routes
router.get("/verify", auth, verifyToken);
router.post("/logout", auth, logout);

export default router;
