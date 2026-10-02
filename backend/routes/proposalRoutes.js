import express from "express";
import upload from "../middleware/upload.js";
import {
  uploadProposal,
  getProposals,
  getOngoingProposals,
  updateProposal,
  deleteProposal,
} from "../controllers/proposalController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================
// PUBLIC ROUTES
// ============================

// Get all projects
router.get("/", getProposals);

// Get ongoing projects (homepage)
router.get("/ongoing", getOngoingProposals);

// ============================
// ADMIN ROUTES
// ============================

// Upload new project (ADMIN ONLY)
router.post(
  "/upload",
  protect,
  admin,
  upload.single("proposalFile"),
  uploadProposal
);

// Update project (ADMIN ONLY)
router.put(
  "/:id",
  protect,
  admin,
  upload.single("proposalFile"),
  updateProposal
);

// Delete project (ADMIN ONLY)
router.delete("/:id", protect, admin, deleteProposal);

export default router;
