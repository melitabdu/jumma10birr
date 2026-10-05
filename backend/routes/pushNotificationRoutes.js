import express from "express";

import {
  registerPushSubscription,
} from "../controllers/pushNotificationController.js";

const router = express.Router();

// Register a device for public push notifications
router.post("/register", registerPushSubscription);

export default router;
