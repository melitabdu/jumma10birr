
import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "TELEBIRR_BASE_URL",
  "TELEBIRR_FABRIC_APP_ID",
  "TELEBIRR_MERCHANT_APP_ID",
  "TELEBIRR_MERCHANT_CODE",
  "TELEBIRR_PRIVATE_KEY",
  "TELEBIRR_NOTIFY_URL",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const telebirrConfig = {
  baseUrl: process.env.TELEBIRR_BASE_URL.replace(/\/+$/, ""),
  fabricAppId: process.env.TELEBIRR_FABRIC_APP_ID,
  appSecret: process.env.TELEBIRR_APP_SECRET,
  merchantAppId: process.env.TELEBIRR_MERCHANT_APP_ID,
  merchantCode: process.env.TELEBIRR_MERCHANT_CODE,
  privateKey: process.env.TELEBIRR_PRIVATE_KEY,
  notifyUrl: process.env.TELEBIRR_NOTIFY_URL,
};
