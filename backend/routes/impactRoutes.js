import express from "express";
import {
  getImpactItems,
  createImpactItem,
  updateImpactItem,
  deleteImpactItem,
} from "../controllers/impactController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getImpactItems);

// Admin protected
router.post("/", protect, admin, createImpactItem);
router.put("/:id", protect, admin, updateImpactItem);
router.delete("/:id", protect, admin, deleteImpactItem);

export default router;
