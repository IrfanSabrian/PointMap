import express from "express";
import {
  getLantaiByBangunan,
  addLantai,
  updateLantai,
  deleteLantai,
} from "../controllers/lantai.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getLantaiByBangunan);
router.post("/", auth, addLantai);
router.put("/:id", auth, updateLantai);
router.delete("/:id", auth, deleteLantai);

export default router;
