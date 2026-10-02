import express from "express";

import {
  createAnnouncement,
  getAnnouncements,
  getPublishedAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// PUBLIC / MOBILE ROUTES
// ==========================================

// Published announcements for mobile app
router.get("/published", getPublishedAnnouncements);

// Single announcement
router.get("/:id", getAnnouncementById);


// ==========================================
// ADMIN ROUTES
// ==========================================

// Get all announcements
router.get("/", protect, admin, getAnnouncements);

// Create announcement
router.post("/", protect, admin, createAnnouncement);

// Update announcement
router.put("/:id", protect, admin, updateAnnouncement);

// Delete announcement
router.delete("/:id", protect, admin, deleteAnnouncement);

export default router;