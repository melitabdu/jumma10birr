import express from "express";
import {
  createTransfer,
  verifyTransfer,
  listTransfers,
  createMockContribution,
  transfersSummary,
  getTransferById,
} from "../controllers/transferController.js";
import { protect, admin, mosqueAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Mosque admin submits actual transfer
router.post("/", protect, mosqueAdmin, createTransfer);

// Community/donor submits mock contribution (simulate payment)
router.post("/mock", protect, createMockContribution);

// Admin verifies transfer
router.put("/:id/verify", protect, admin, verifyTransfer);

// Admin lists transfers (with optional filters)
router.get("/", protect, admin, listTransfers);

// Admin fetches single transfer by ID
router.get("/:id", protect, admin, getTransferById);

// Admin dashboard summary
router.get("/summary", protect, admin, transfersSummary);

export default router;
