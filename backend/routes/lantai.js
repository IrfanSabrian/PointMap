import express from "express";
import {
  getLantaiByGedung,
  addLantai,
  updateLantai,
  deleteLantai,
} from "../controllers/lantai.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getLantaiByGedung);

router.post("/", auth, addLantai);
router.put("/:id", auth, updateLantai);
router.delete("/:id", auth, deleteLantai);

export default router;
