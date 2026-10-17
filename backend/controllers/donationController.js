
import axios from "axios";
import crypto from "crypto";
import {
  KJUR,
  KEYUTIL,
  hextob64,
} from "jsrsasign";

import { telebirrConfig } from "../config/telebirrConfig.js";
import { Donation } from "../models/donationModel.js";

const http = axios.create({
  timeout: 20000,
  // Keep normal TLS certificate verification enabled.
});

function createNonce() {
  return crypto.randomBytes(16).toString("hex").toUpperCase();
}

function createSignature(text) {
  const key = KEYUTIL.getKey(telebirrConfig.privateKey);

  const signer = new KJUR.crypto.Signature({
    alg: "SHA256withRSAandMGF1",
  });

  signer.init(key);
  signer.updateString(text);

  return hextob64(signer.sign());
}

// Follow the signing-string construction in the supplied demo.
function signRequestObject(requestObject) {
  const excluded = [
    "sign",
    "sign_type",
    "header",
    "refund_info",
    "openType",
    "raw_request",
    "biz_content",
  ];

  const values = {};

  for (const [key, value] of Object.entries(requestObject)) {
    if (!excluded.includes(key) && value !== undefined && value !== null) {
      values[key] = value;
    }
  }

  if (requestObject.biz_content) {
    for (const [key, value] of Object.entries(
      requestObject.biz_content
    )) {
      if (!excluded.includes(key) && value !== undefined && value !== null) {
        values[key] = value;
      }
    }
  }

  const signingString = Object.keys(values)
    .sort()
    .map((key) => `${key}=${values[key]}`)
    .join("&");

  return createSignature(signingString);
}

async function getFabricToken() {
  const response = await http.post(
    `${telebirrConfig.baseUrl}/payment/v1/token`,
    {
      appSecret: telebirrConfig.appSecret,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-APP-Key": telebirrConfig.fabricAppId,
      },
    }
  );

  const token = response.data?.token;

  if (!token || typeof token !== "string") {
    throw new Error(
      "Telebirr token response did not contain a valid token."
    );
  }

  return token;
}

async function createPreOrder({ outTradeNo, amount, title }) {
  const fabricToken = await getFabricToken();

  const requestObject = {
    timestamp: Math.floor(Date.now() / 1000).toString(),
    nonce_str: createNonce(),
    method: "payment.preorder",
    version: "1.0",
    biz_content: {
      notify_url: telebirrConfig.notifyUrl,
      appid: telebirrConfig.merchantAppId,
      merch_code: telebirrConfig.merchantCode,
      merch_order_id: outTradeNo,
      trade_type: "Checkout",
      title,
      total_amount: amount.toFixed(2),
      trans_currency: "ETB",
      timeout_express: "120m",
    },
  };

  requestObject.sign = signRequestObject(requestObject);
  requestObject.sign_type = "SHA256WithRSA";
  console.log("TELEBIRR ORDER CALLBACK CONFIG:", {
  notifyUrl: telebirrConfig.notifyUrl,
  outTradeNo,
});

  const response = await http.post(
    `${telebirrConfig.baseUrl}/payment/v1/merchant/preOrder`,
    requestObject,
    {
      headers: {
        "Content-Type": "application/json",
        "X-APP-Key": telebirrConfig.fabricAppId,
        Authorization: fabricToken,
      },
    }
  );

  const prepayId = response.data?.biz_content?.prepay_id;

  if (!prepayId) {
    // Do not log secrets, tokens, private keys, or full signed requests.
    throw new Error(
      `Telebirr pre-order did not return a prepay_id. ` +
      `Provider response: ${JSON.stringify({
        code: response.data?.code ?? null,
        message: response.data?.message ?? null,
        result: response.data?.result ?? null,
      })}`
    );
  }

  return prepayId;
}
export async function queryTelebirrOrder(outTradeNo) {
  const token = await getFabricToken();

  const requestObject = {
    timestamp: Math.floor(Date.now() / 1000).toString(),
    nonce_str: crypto.randomBytes(16).toString("hex").toUpperCase(),
    method: "payment.queryorder",
    version: "1.0",
    biz_content: {
      appid: telebirrConfig.merchantAppId,
      merch_code: telebirrConfig.merchantCode,
      merch_order_id: outTradeNo,
    },
  };

  requestObject.sign = signRequestObject(requestObject);
  requestObject.sign_type = "SHA256WithRSA";

  const response = await http.post(
    `${telebirrConfig.baseUrl}/payment/v1/merchant/queryOrder`,
    requestObject,
    {
      headers: {
        "Content-Type": "application/json",
        "X-APP-Key": telebirrConfig.fabricAppId,
        Authorization: token,
      },
    }
  );



  return response.data;
}

async function verifyAndUpdateDonation(outTradeNo) {
  const donation = await Donation.findOne({ outTradeNo });

  if (!donation) {
    return { found: false };
  }

  // Already confirmed: make repeated calls safe.
  if (donation.status === "PAID") {
    return {
      found: true,
      updated: false,
      status: "PAID",
    };
  }

  const result = await queryTelebirrOrder(outTradeNo);
  const payment = result?.biz_content;

  if (
    result?.result !== "SUCCESS" ||
    String(result?.code) !== "0" ||
    payment?.merch_order_id !== outTradeNo
  ) {
    throw new Error("Telebirr did not return a valid order confirmation.");
  }

  if (
    Math.abs(Number(payment.total_amount) - donation.amount) > 0.001 ||
    payment.trans_currency !== "ETB"
  ) {
    throw new Error("Telebirr payment amount or currency mismatch.");
  }

  if (payment.order_status !== "PAY_SUCCESS") {
    return {
      found: true,
      updated: false,
      status: donation.status,
      telebirrStatus: payment.order_status,
    };
  }

  const paidAt = payment.trans_time
    ? new Date(payment.trans_time.replace(" ", "T") + "+03:00")
    : new Date();

  // Only update records that have not already been paid.
  const updated = await Donation.findOneAndUpdate(
    { outTradeNo, status: { $ne: "PAID" } },
    {
      $set: {
        status: "PAID",
        paidAt,
        gatewayTransactionId: payment.trans_id || null,
      },
    },
    { new: true }
  );

  const finalDonation =
    updated || await Donation.findOne({ outTradeNo });

  return {
    found: true,
    updated: Boolean(updated),
    status: finalDonation?.status,
    outTradeNo,
    gatewayTransactionId: finalDonation?.gatewayTransactionId,
  };
}

export const verifyDonationStatus = async (req, res) => {
  try {
    const { outTradeNo } = req.params;

    if (
      typeof outTradeNo !== "string" ||
      !/^DON[A-Za-z0-9]+$/.test(outTradeNo)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation order number.",
      });
    }

    const result = await verifyAndUpdateDonation(outTradeNo);

    if (!result.found) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      donationStatus: result.status,
      updated: result.updated,
      telebirrStatus: result.telebirrStatus || null,
      outTradeNo,
    });
  } catch (error) {
    console.error("DONATION VERIFICATION FAILED:", error.message);

    return res.status(502).json({
      success: false,
      message: "Unable to verify payment right now. Please try again.",
    });
  }
};


function createCheckoutUrl(prepayId) {
  const params = {
    appid: telebirrConfig.merchantAppId,
    merch_code: telebirrConfig.merchantCode,
    nonce_str: createNonce(),
    prepay_id: prepayId,
    timestamp: Math.floor(Date.now() / 1000).toString(),
  };

  const signature = signRequestObject(params);

  const query = new URLSearchParams({
    ...params,
    sign: signature,
    sign_type: "SHA256WithRSA",
    version: "1.0",
    trade_type: "Checkout",
  });

  const separator = telebirrConfig.webBaseUrl.includes("?")
    ? (telebirrConfig.webBaseUrl.endsWith("?") ||
       telebirrConfig.webBaseUrl.endsWith("&") ? "" : "&")
    : "?";

  return `${telebirrConfig.webBaseUrl}${separator}${query.toString()}`;
}


export const initiateDonation = async (req, res) => {
  let donation;

  try {
    const { amount, donorName, donationType } = req.body;

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      numericAmount > 10000000
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid donation amount.",
      });
    }

    // This example accepts two decimal places.
    if (Math.round(numericAmount * 100) !== numericAmount * 100) {
      return res.status(400).json({
        success: false,
        message: "The donation amount can have at most two decimal places.",
      });
    }

    // A timestamp plus random bytes makes accidental collisions unlikely.
    const outTradeNo =
      `DON${Date.now()}${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    donation = await Donation.create({
      outTradeNo,
      amount: numericAmount,
      donorName:
        typeof donorName === "string" && donorName.trim()
          ? donorName.trim().slice(0, 100)
          : "Anonymous",
      donationType:
        typeof donationType === "string"
          ? donationType.slice(0, 50)
          : "Sadaqah",
      status: "PENDING",
    });

    const prepayId = await createPreOrder({
      outTradeNo,
      amount: numericAmount,
      title: `EIASC Donation ${outTradeNo}`,
    });

    const paymentUrl = createCheckoutUrl(prepayId);

    return res.status(200).json({
      success: true,
      outTradeNo,
      paymentUrl,
      status: donation.status,
    });
  } catch (error) {
    
console.error("Telebirr initiation failed:", {
  status: error.response?.status ?? null,
  providerResponse: error.response?.data ?? null,
  providerUrl: error.config?.url ?? null,
  message: error.message,
});


    return res.status(502).json({
      success: false,
      message: "Could not initialize Telebirr checkout.",
      // Safe diagnostic detail; never return credentials or signed requests.
      providerCode: error.response?.data?.code ?? undefined,
      providerMessage: error.response?.data?.message ?? undefined,
    });
  }
};

// Important: never mark a donation PAID just because a callback
// contains an order number. Add the official callback-signature and
// payment-status verification before enabling this update.

export const handleNotification = async (req, res) => {
  try {
    const body = req.body || {};
    const payload = body.biz_content || body.data || body;

    const outTradeNo =
      payload.merch_order_id ||
      payload.merchOrderId ||
      payload.outTradeNo;

    if (
      typeof outTradeNo !== "string" ||
      !/^DON[A-Za-z0-9]+$/.test(outTradeNo)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification order number.",
      });
    }

    // Never trust callback status alone. Query Telebirr directly.
    const result = await verifyAndUpdateDonation(outTradeNo);

    if (!result.found) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification processed.",
    });
  } catch (error) {
    console.error("TELEBIRR NOTIFICATION PROCESSING FAILED:", error.message);

    return res.status(500).json({
      success: false,
      message: "Notification processing failed.",
    });
  }
};
