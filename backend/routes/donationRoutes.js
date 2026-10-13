
import express from "express";
import {
  initiateDonation,
  handleNotification,
} from "../controllers/donationController.js";

const router = express.Router();

router.post("/initiate-donation", initiateDonation);
router.post("/telebirr/notify", handleNotification);

export default router;
