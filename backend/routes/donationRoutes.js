import express from "express";
import {
  createDonation, 
  createChapaDonation,
  verifyChapaPayment,
  chapaWebhook,
  telebirrWebhook,
  listDonations,
  donationsByUser,
  updateDonation,
  deleteDonation,
} from "../controllers/donationController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/** 🌍 Public Webhooks */
router.post("/webhook/chapa", chapaWebhook);
router.post("/webhook/telebirr", telebirrWebhook);

/** 💰 Protected Donations */
router.post("/", protect, createDonation);
router.post("/chapa", protect, createChapaDonation);

/** ✅ Chapa Verify Redirect */
router.get("/chapa/verify/:txRef", verifyChapaPayment);

/** 👤 User Donations */
router.get("/user/:userId", protect, donationsByUser);

/** 🛠️ Admin Routes */
router.get("/", protect, admin, listDonations);
router.put("/:id", protect, admin, updateDonation);
router.delete("/:id", protect, admin, deleteDonation);

export default router;
