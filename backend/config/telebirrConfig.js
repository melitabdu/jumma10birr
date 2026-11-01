
import "dotenv/config";

const getRequired = (name) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
};

// Read environment variables
const baseUrl = getRequired("TELEBIRR_BASE_URL");
const webBaseUrl = getRequired("TELEBIRR_WEB_BASE_URL");

const fabricAppId = getRequired("TELEBIRR_FABRIC_APP_ID");
const appSecret = getRequired("TELEBIRR_APP_SECRET");

const merchantAppId = getRequired("TELEBIRR_MERCHANT_APP_ID");
const merchantCode = getRequired("TELEBIRR_MERCHANT_CODE");

const privateKey = getRequired("TELEBIRR_PRIVATE_KEY");
const notifyUrl = getRequired("TELEBIRR_NOTIFY_URL");

// Validate merchant application ID
if (!/^\d+$/.test(merchantAppId)) {
  throw new Error(
    "Invalid TELEBIRR_MERCHANT_APP_ID. " +
    "It must contain digits only. " +
    "Do not use TELEBIRR_FABRIC_APP_ID here."
  );
}

export const telebirrConfig = {
  baseUrl: baseUrl.replace(/\/+$/, ""),

  webBaseUrl,

  fabricAppId,

  appSecret,

  merchantAppId,

  merchantCode,

  privateKey: privateKey.replace(/\\n/g, "\n"),

  notifyUrl,
};
