import express from "express";
import {
  getAllJurusan,
  addJurusan,
  updateJurusan,
  deleteJurusan,
} from "../controllers/jurusan.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllJurusan); // public
router.post("/", auth, addJurusan); // admin
router.put("/:id", auth, updateJurusan); // admin
router.delete("/:id", auth, deleteJurusan); // admin

export default router;
