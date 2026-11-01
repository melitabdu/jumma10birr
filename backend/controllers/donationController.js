
import axios from "axios";
import crypto from "crypto";
import {
  KJUR,
  KEYUTIL,
  hextob64,
} from "jsrsasign";

import { telebirrConfig } from "../config/telebirrConfig.js";
import { Donation } from "../models/donationModel.js";

// =====================================================
// HTTP CLIENT
// =====================================================

const http = axios.create({
  timeout: 20000,
  // Keep normal TLS certificate verification enabled.
});

// =====================================================
// DIAGNOSTIC HELPERS
// =====================================================

function logDiagnostic(title, data) {
  console.log(`\n========== ${title} ==========`);
  console.log(JSON.stringify(data, null, 2));
  console.log(`========== END ${title} ==========\n`);
}

function summarizeProviderResponse(data) {
  return {
    success: data?.success ?? null,
    result: data?.result ?? null,
    code: data?.code ?? null,
    message: data?.message ?? null,
    responseCode: data?.responseCode ?? null,
    responseDesc: data?.responseDesc ?? null,
    errorCause: data?.errorCause ?? null,
    hasPrepayId: Boolean(data?.biz_content?.prepay_id),
    hasToken: Boolean(data?.token),
  };
}

function logHttpError(title, error) {
  logDiagnostic(title, {
    message: error.message,
    code: error.code ?? null,
    httpStatus: error.response?.status ?? null,
    providerUrl: error.config?.url ?? null,
    providerResponse: summarizeProviderResponse(
      error.response?.data
    ),
  });
}

function inspectCheckoutUrl(checkoutUrl) {
  try {
    const parsed = new URL(checkoutUrl);

    return {
      hostname: parsed.hostname,
      pathname: parsed.pathname,
      protocol: parsed.protocol,
      queryParameterNames: [
        ...parsed.searchParams.keys(),
      ],
      hasAppId: parsed.searchParams.has("appid"),
      hasMerchantCode: parsed.searchParams.has("merch_code"),
      hasPrepayId: parsed.searchParams.has("prepay_id"),
      hasSignature: parsed.searchParams.has("sign"),
      hasTradeType: parsed.searchParams.has("trade_type"),
    };
  } catch {
    return {
      validUrl: false,
    };
  }
}

// =====================================================
// NONCE AND SIGNATURE
// =====================================================

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
    if (
      !excluded.includes(key) &&
      value !== undefined &&
      value !== null
    ) {
      values[key] = value;
    }
  }

  if (requestObject.biz_content) {
    for (const [key, value] of Object.entries(
      requestObject.biz_content
    )) {
      if (
        !excluded.includes(key) &&
        value !== undefined &&
        value !== null
      ) {
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

// =====================================================
// FABRIC TOKEN
// =====================================================

async function getFabricToken() {
  const tokenUrl =
    `${telebirrConfig.baseUrl}/payment/v1/token`;

  logDiagnostic("TELEBIRR TOKEN REQUEST", {
    url: tokenUrl,
    method: "POST",
    appKeyConfigured: Boolean(telebirrConfig.fabricAppId),
    appSecretConfigured: Boolean(telebirrConfig.appSecret),
  });

  try {
    const response = await http.post(
      tokenUrl,
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

    logDiagnostic("TELEBIRR TOKEN RESPONSE", {
      httpStatus: response.status,
      tokenReceived: Boolean(response.data?.token),
      providerResponse: summarizeProviderResponse(
        response.data
      ),
    });

    const token = response.data?.token;

    if (!token || typeof token !== "string") {
      throw new Error(
        "Telebirr token response did not contain a valid token."
      );
    }

    return token;
  } catch (error) {
    logHttpError("TELEBIRR TOKEN REQUEST FAILED", error);
    throw error;
  }
}

// =====================================================
// CREATE PRE-ORDER
// =====================================================

async function createPreOrder({
  outTradeNo,
  amount,
  title,
}) {
  const fabricToken = await getFabricToken();

  const appId = telebirrConfig.merchantAppId;

  const requestObject = {
    timestamp: Math.floor(Date.now() / 1000).toString(),
    nonce_str: createNonce(),
    method: "payment.preorder",
    version: "1.0",

    biz_content: {
      notify_url: telebirrConfig.notifyUrl,
      appid: appId,
      merch_code: telebirrConfig.merchantCode,
      merch_order_id: outTradeNo,
      trade_type: "Checkout",
      title,
      total_amount: amount.toFixed(2),
      trans_currency: "ETB",
      timeout_express: "120m",
    },
  };

  // Diagnose App ID without exposing credentials.
  logDiagnostic("TELEBIRR APP ID DIAGNOSTIC", {
    appIdType: typeof appId,
    appIdIsNumeric:
      typeof appId === "number"
        ? Number.isFinite(appId)
        : typeof appId === "string"
          ? /^\d+$/.test(appId)
          : false,
    appIdConfigured: appId !== undefined && appId !== null,
    merchantCodeConfigured: Boolean(
      telebirrConfig.merchantCode
    ),
    fabricAppIdConfigured: Boolean(
      telebirrConfig.fabricAppId
    ),
  });

  requestObject.sign = signRequestObject(requestObject);
  requestObject.sign_type = "SHA256WithRSA";

  logDiagnostic("TELEBIRR PREORDER REQUEST", {
    url: `${telebirrConfig.baseUrl}/payment/v1/merchant/preOrder`,
    method: "POST",
    outTradeNo,
    amount: amount.toFixed(2),
    currency: "ETB",
    tradeType: "Checkout",
    notifyUrl: telebirrConfig.notifyUrl,
    appIdType: typeof appId,
    appIdIsNumeric:
      typeof appId === "number"
        ? Number.isFinite(appId)
        : typeof appId === "string"
          ? /^\d+$/.test(appId)
          : false,
    signatureGenerated: Boolean(requestObject.sign),
    fabricTokenAvailable: Boolean(fabricToken),
  });

  try {
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

    logDiagnostic("TELEBIRR PREORDER RESPONSE", {
      httpStatus: response.status,
      providerResponse: summarizeProviderResponse(
        response.data
      ),
      outTradeNo,
    });

    const prepayId = response.data?.biz_content?.prepay_id;

    if (!prepayId) {
      throw new Error(
        `Telebirr pre-order did not return a prepay_id. ` +
        `Provider response: ${JSON.stringify(
          summarizeProviderResponse(response.data)
        )}`
      );
    }

    logDiagnostic("TELEBIRR PREORDER SUCCESS", {
      outTradeNo,
      prepayIdReceived: true,
    });

    return prepayId;
  } catch (error) {
    logHttpError("TELEBIRR PREORDER FAILED", error);
    throw error;
  }
}

// =====================================================
// QUERY TELEBIRR ORDER
// =====================================================

export async function queryTelebirrOrder(outTradeNo) {
  const token = await getFabricToken();

  const requestObject = {
    timestamp: Math.floor(Date.now() / 1000).toString(),
    nonce_str: createNonce(),
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

  logDiagnostic("TELEBIRR QUERY ORDER REQUEST", {
    outTradeNo,
    appIdType: typeof telebirrConfig.merchantAppId,
    signatureGenerated: Boolean(requestObject.sign),
  });

  try {
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

    logDiagnostic("TELEBIRR QUERY ORDER RESPONSE", {
      httpStatus: response.status,
      outTradeNo,
      providerResponse: summarizeProviderResponse(
        response.data
      ),
      orderStatus:
        response.data?.biz_content?.order_status ?? null,
    });

    return response.data;
  } catch (error) {
    logHttpError("TELEBIRR QUERY ORDER FAILED", error);
    throw error;
  }
}

// =====================================================
// VERIFY AND UPDATE DONATION
// =====================================================

async function verifyAndUpdateDonation(outTradeNo) {
  const donation = await Donation.findOne({ outTradeNo });

  if (!donation) {
    return { found: false };
  }

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
    throw new Error(
      "Telebirr did not return a valid order confirmation."
    );
  }

  if (
    Math.abs(
      Number(payment.total_amount) - donation.amount
    ) > 0.001 ||
    payment.trans_currency !== "ETB"
  ) {
    throw new Error(
      "Telebirr payment amount or currency mismatch."
    );
  }

  if (payment.order_status !== "PAY_SUCCESS") {
    logDiagnostic("TELEBIRR PAYMENT NOT YET SUCCESSFUL", {
      outTradeNo,
      orderStatus: payment.order_status,
      donationStatus: donation.status,
    });

    return {
      found: true,
      updated: false,
      status: donation.status,
      telebirrStatus: payment.order_status,
    };
  }

  const paidAt = payment.trans_time
    ? new Date(
        payment.trans_time.replace(" ", "T") + "+03:00"
      )
    : new Date();

  const updated = await Donation.findOneAndUpdate(
    {
      outTradeNo,
      status: { $ne: "PAID" },
    },
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

  logDiagnostic("DONATION PAYMENT STATUS", {
    outTradeNo,
    updated: Boolean(updated),
    status: finalDonation?.status,
  });

  return {
    found: true,
    updated: Boolean(updated),
    status: finalDonation?.status,
    outTradeNo,
    gatewayTransactionId:
      finalDonation?.gatewayTransactionId,
  };
}

// =====================================================
// VERIFY DONATION STATUS ENDPOINT
// =====================================================

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
    console.error(
      "DONATION VERIFICATION FAILED:",
      error.message
    );

    return res.status(502).json({
      success: false,
      message:
        "Unable to verify payment right now. Please try again.",
    });
  }
};

// =====================================================
// CREATE CHECKOUT URL
// =====================================================

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
    ? (
        telebirrConfig.webBaseUrl.endsWith("?") ||
        telebirrConfig.webBaseUrl.endsWith("&")
          ? ""
          : "&"
      )
    : "?";

  const checkoutUrl =
    `${telebirrConfig.webBaseUrl}${separator}${query.toString()}`;

  // Do not log the full URL because it contains signed
  // payment parameters and a prepay ID.
  logDiagnostic("TELEBIRR CHECKOUT URL GENERATED", {
    ...inspectCheckoutUrl(checkoutUrl),
    prepayIdReceived: Boolean(prepayId),
    signatureGenerated: Boolean(signature),
    appIdType: typeof params.appid,
    appIdIsNumeric:
      typeof params.appid === "number"
        ? Number.isFinite(params.appid)
        : typeof params.appid === "string"
          ? /^\d+$/.test(params.appid)
          : false,
  });

  return checkoutUrl;
}

// =====================================================
// INITIATE DONATION ENDPOINT
// =====================================================

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

    if (
      Math.round(numericAmount * 100) !==
      numericAmount * 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The donation amount can have at most two decimal places.",
      });
    }

    const outTradeNo =
      `DON${Date.now()}${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    logDiagnostic("DONATION INITIATION", {
      outTradeNo,
      amount: numericAmount,
      donationType,
      requestContentType: req.headers["content-type"] ?? null,
      backendNodeVersion: process.version,
    });

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

    logDiagnostic("DONATION CHECKOUT READY", {
      outTradeNo,
      donationStatus: donation.status,
      checkoutUrl: inspectCheckoutUrl(paymentUrl),
      responseSuccess: true,
    });

    return res.status(200).json({
      success: true,
      outTradeNo,
      paymentUrl,
      status: donation.status,
    });
  } catch (error) {
    logHttpError("TELEBIRR DONATION INITIATION FAILED", error);

    return res.status(502).json({
      success: false,
      message: "Could not initialize Telebirr checkout.",
      providerCode:
        error.response?.data?.code ??
        error.response?.data?.responseCode ??
        undefined,
      providerMessage:
        error.response?.data?.message ??
        error.response?.data?.responseDesc ??
        undefined,
    });
  }
};

// =====================================================
// TELEBIRR NOTIFICATION ENDPOINT
// =====================================================

// Important: Never mark a donation PAID just because
// a callback contains an order number.
// Query Telebirr directly and verify the payment.

export const handleNotification = async (req, res) => {
  try {
    const body = req.body || {};
    const payload = body.biz_content || body.data || body;

    const outTradeNo =
      payload.merch_order_id ||
      payload.merchOrderId ||
      payload.outTradeNo;

    logDiagnostic("TELEBIRR NOTIFICATION RECEIVED", {
      outTradeNo: outTradeNo || null,
      contentType: req.headers["content-type"] ?? null,
    });

    if (
      typeof outTradeNo !== "string" ||
      !/^DON[A-Za-z0-9]+$/.test(outTradeNo)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification order number.",
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
      message: "Notification processed.",
    });
  } catch (error) {
    console.error(
      "TELEBIRR NOTIFICATION PROCESSING FAILED:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Notification processing failed.",
    });
  }
};
