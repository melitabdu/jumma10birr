import express from "express";
import {
  createMosque,
  listMosques,
  getMosque,
  updateMosque,
  deleteMosque,
} from "../controllers/mosqueController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, admin, createMosque);
router.get("/", protect, admin, listMosques);
router.get("/:identifier", getMosque); // public provider page uses this
router.put("/:id", protect, admin, updateMosque);
router.delete("/:id", protect, admin, deleteMosque);

export default router;
