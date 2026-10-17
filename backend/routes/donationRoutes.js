
import express from "express";
import {
  initiateDonation,
  handleNotification,
  queryTelebirrOrder,
} from "../controllers/donationController.js";

const router = express.Router();

router.post("/initiate-donation", initiateDonation);
router.post("/telebirr/notify", handleNotification);

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
        message: "A valid donation outTradeNo is required.",
      });
    }

    const result = await queryTelebirrOrder(outTradeNo);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(
      "TELEBIRR QUERY DIAGNOSTIC FAILED:",
      error.response?.data || error.message
    );

    return res.status(502).json({
      success: false,
      message: "Telebirr order query failed.",
      providerResponse: error.response?.data || null,
    });
  }
});


export default router;
