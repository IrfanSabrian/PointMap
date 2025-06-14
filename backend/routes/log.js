import express from "express";
import { getStatistikKunjungan } from "../controllers/log.js";
import auth from "../middlewares/auth.js";

const router = express.Router();
router.get("/statistik", auth, getStatistikKunjungan);
export default router;
