import express from "express";

import {
  createNews,
  getNews,
  getPublishedNews,
  getNewsById,
  updateNews,
  deleteNews,
  getFeaturedNews,
} from "../controllers/newsController.js";

import newsUpload from "../middleware/newsUpload.js";

const router = express.Router();

// Create News
router.post(
  "/",
  newsUpload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
    {
      name: "video",
      maxCount: 1,
    },
  ]),
  createNews
);

// Get all News
router.get("/", getNews);

// Get published News
router.get("/published", getPublishedNews);

// Get featured News
router.get("/featured", getFeaturedNews);

// Get one News item
router.get("/:id", getNewsById);

// Update News
router.put(
  "/:id",
  newsUpload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
    {
      name: "video",
      maxCount: 1,
    },
  ]),
  updateNews
);

// Delete News
router.delete("/:id", deleteNews);

export default router;