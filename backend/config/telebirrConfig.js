import dotenv from "dotenv";

dotenv.config();

const telebirrConfig = {
  baseUrl: process.env.TELEBIRR_BASE_URL,

  fabricAppId: process.env.TELEBIRR_FABRIC_APP_ID,

  appSecret: process.env.TELEBIRR_APP_SECRET,

  merchantAppId: process.env.TELEBIRR_MERCHANT_APP_ID,

  merchantCode: process.env.TELEBIRR_MERCHANT_CODE,

  privateKey: process.env.TELEBIRR_PRIVATE_KEY,
};

export { telebirrConfig };