import express from "express";
import {
  getAllGedung,
  addGedung,
  updateGedung,
  deleteGedung,
} from "../controllers/gedung.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getAllGedung); // public
router.post("/", auth, addGedung); // admin
router.put("/:id", auth, updateGedung); // admin
router.delete("/:id", auth, deleteGedung); // admin

export default router;
