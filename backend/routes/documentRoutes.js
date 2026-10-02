import express from "express";
import { createDocument } from "../controllers/documentController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/",
  upload.single("file"),
  createDocument
);

export default router;