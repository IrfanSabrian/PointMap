import express from "express";
import {
  getAllProdi,
  addProdi,
  updateProdi,
  deleteProdi,
} from "../controllers/prodi.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllProdi); // public
router.post("/", auth, addProdi); // admin
router.put("/:id", auth, updateProdi); // admin
router.delete("/:id", auth, deleteProdi); // admin

export default router;
