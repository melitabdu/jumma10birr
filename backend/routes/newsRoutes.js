import express from "express";

import {
  createNews,
  getNews,
  getPublishedNews,
  getFeaturedNews,
  getNewsById,
  updateNews,
  deleteNews,
} from "../controllers/newsController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// PUBLIC / MOBILE ROUTES
// ==========================================

// Published news for mobile app
router.get("/published", getPublishedNews);

// Featured news for Hajji home page
router.get("/featured", getFeaturedNews);

// Single news article
router.get("/:id", getNewsById);


// ==========================================
// ADMIN ROUTES
// ==========================================

// Get all news
router.get("/", protect, admin, getNews);

// Create news
router.post("/", protect, admin, createNews);

// Update news
router.put("/:id", protect, admin, updateNews);

// Delete news
router.delete("/:id", protect, admin, deleteNews);

export default router;