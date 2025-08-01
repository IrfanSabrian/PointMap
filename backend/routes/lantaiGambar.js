import express from "express";
import {
  getAllLantaiGambar,
  getLantaiGambarById,
  getLantaiGambarByBangunan,
  addLantaiGambar,
  updateLantaiGambar,
  deleteLantaiGambar,
} from "../controllers/lantaiGambar.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllLantaiGambar); // public
router.get("/bangunan/:id_bangunan", getLantaiGambarByBangunan); // public
router.get("/:id", getLantaiGambarById); // public
router.post("/", auth, addLantaiGambar); // admin
router.put("/:id", auth, updateLantaiGambar); // admin
router.delete("/:id", auth, deleteLantaiGambar); // admin

export default router;
