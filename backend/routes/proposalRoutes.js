
import express from "express";

import upload from "../middleware/upload.js";

import {
  uploadProposal,
  getProposals,
  getPlannedProposals,
  getOngoingProposals,
  getCompletedProposals,
  getProposalById,
  updateProposal,
  deleteProposal,
} from "../controllers/proposalController.js";

import {
  protect,
  admin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// =====================================
// PUBLIC ROUTES
// =====================================

// Get all projects
router.get("/", getProposals);

// Get projects by status
router.get("/planned", getPlannedProposals);
router.get("/ongoing", getOngoingProposals);
router.get("/completed", getCompletedProposals);

// Get one project by ID
router.get("/:id", getProposalById);

// =====================================
// ADMIN ROUTES
// =====================================

// Upload a new project with its image and document
router.post(
  "/upload",
  protect,
  admin,
  upload.fields([
    { name: "proposalFile", maxCount: 1 },
    { name: "imageFile", maxCount: 1 },
  ]),
  (req, res, next) => {
    console.log("========== PROPOSAL UPLOAD DEBUG ==========");
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("File fields:", Object.keys(req.files || {}));

    console.log(
      "Proposal filename:",
      req.files?.proposalFile?.[0]?.originalname || "NOT RECEIVED"
    );

    console.log(
      "Image filename:",
      req.files?.imageFile?.[0]?.originalname || "NOT RECEIVED"
    );

    console.log("Body fields:", Object.keys(req.body || {}));
    console.log("===========================================");

    next();
  },
  uploadProposal
);

// Update project information, image, or document
router.put(
  "/:id",
  protect,
  admin,
  upload.fields([
    { name: "proposalFile", maxCount: 1 },
    { name: "imageFile", maxCount: 1 },
  ]),
  updateProposal
);

// Delete project
router.delete(
  "/:id",
  protect,
  admin,
  deleteProposal
);

export default router;
