
import express from "express";
import {
  initiateDonation,
  handleNotification,
  queryTelebirrOrder,
  verifyDonationStatus
} from "../controllers/donationController.js";
import { Donation } from "../models/donationModel.js";

const router = express.Router();

router.post("/initiate-donation", initiateDonation);
router.post("/telebirr/notify", handleNotification);
router.get("/verify/:outTradeNo", verifyDonationStatus);

// Temporary diagnostic route — remove after testing.


router.post("/diagnostic/query-order", async (req, res) => {
  const expectedSecret = process.env.TELEBIRR_DIAGNOSTIC_SECRET;
  const suppliedSecret = req.get("x-diagnostic-secret");

  if (!expectedSecret || suppliedSecret !== expectedSecret) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const { outTradeNo } = req.body;

    if (
      typeof outTradeNo !== "string" ||
      !/^DON[A-Za-z0-9]+$/.test(outTradeNo)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation order number.",
      });
    }

    const donation = await Donation.findOne({ outTradeNo });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found in MongoDB.",
      });
    }

    const result = await queryTelebirrOrder(outTradeNo);
    const payment = result?.biz_content;

    if (
      result?.result !== "SUCCESS" ||
      String(result?.code) !== "0" ||
      !payment
    ) {
      return res.status(502).json({
        success: false,
        message: "Telebirr did not confirm the order query.",
      });
    }

    if (payment.merch_order_id !== outTradeNo) {
      return res.status(409).json({
        success: false,
        message: "Telebirr order number mismatch.",
      });
    }

    if (Math.abs(Number(payment.total_amount) - donation.amount) > 0.001) {
      return res.status(409).json({
        success: false,
        message: "Payment amount does not match the stored donation.",
      });
    }

    if (payment.order_status !== "PAY_SUCCESS") {
      return res.status(200).json({
        success: true,
        updated: false,
        donationStatus: donation.status,
        telebirrStatus: payment.order_status,
        message: "Payment is not confirmed as successful.",
      });
    }

    donation.status = "PAID";
    donation.paidAt = payment.trans_time
      ? new Date(payment.trans_time.replace(" ", "T") + "+03:00")
      : new Date();
    donation.gatewayTransactionId = payment.trans_id || null;

    await donation.save();

    return res.status(200).json({
      success: true,
      updated: true,
      outTradeNo: donation.outTradeNo,
      donationStatus: donation.status,
      amount: donation.amount,
      gatewayTransactionId: donation.gatewayTransactionId,
      message: "Verified payment saved to MongoDB.",
    });
  } catch (error) {
    console.error(
      "TELEBIRR QUERY/UPDATE FAILED:",
      error.response?.data || error.message
    );

    return res.status(502).json({
      success: false,
      message: "Payment verification or database update failed.",
    });
  }
});


export default router;
