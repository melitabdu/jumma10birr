import express from "express";

import {
  registerPushToken,
  sendPushNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// Public mobile-app token registration
router.post("/register", registerPushToken);

// Admin sends notification
router.post("/send", sendPushNotification);

export default router;