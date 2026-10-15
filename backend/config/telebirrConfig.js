
import "dotenv/config";

const required = [
  "TELEBIRR_BASE_URL",
  "TELEBIRR_WEB_BASE_URL",
  "TELEBIRR_FABRIC_APP_ID",
  "TELEBIRR_APP_SECRET",
  "TELEBIRR_MERCHANT_APP_ID",
  "TELEBIRR_MERCHANT_CODE",
  "TELEBIRR_PRIVATE_KEY",
  "TELEBIRR_NOTIFY_URL",
];

for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`Missing environment variable: ${name}`);
  }
}

export const telebirrConfig = {
  baseUrl: process.env.TELEBIRR_BASE_URL.replace(/\/+$/, ""),
  webBaseUrl: process.env.TELEBIRR_WEB_BASE_URL,
  fabricAppId: process.env.TELEBIRR_FABRIC_APP_ID,
  appSecret: process.env.TELEBIRR_APP_SECRET,
  merchantAppId: process.env.TELEBIRR_MERCHANT_APP_ID,
  merchantCode: process.env.TELEBIRR_MERCHANT_CODE,
  privateKey: process.env.TELEBIRR_PRIVATE_KEY.replace(/\\n/g, "\n"),
  notifyUrl: process.env.TELEBIRR_NOTIFY_URL,
};
