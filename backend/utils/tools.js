
import crypto from "crypto";
import { telebirrConfig } from "../config/telebirrConfig.js";
import pmlib from "./sign-util-lib.js";

const excludeFields = [
  "sign",
  "sign_type",
  "header",
  "refund_info",
  "openType",
  "raw_request",
  "biz_content",
];

export function signString(text, privateKey) {
  const signer = new pmlib.rs.KJUR.crypto.Signature({
    alg: "SHA256withRSAandMGF1",
  });

  signer.init(privateKey);
  signer.updateString(text);

  return pmlib.rs.hextob64(signer.sign());
}

export function signRequestObject(requestObject) {
  const fieldMap = {};
  const fields = [];

  for (const key in requestObject) {
    if (excludeFields.includes(key)) continue;

    fields.push(key);
    fieldMap[key] = requestObject[key];
  }

  if (requestObject.biz_content) {
    for (const key in requestObject.biz_content) {
      if (excludeFields.includes(key)) continue;

      fields.push(key);
      fieldMap[key] = requestObject.biz_content[key];
    }
  }

  fields.sort();

  const signOriginStr = fields
    .map((key) => `${key}=${fieldMap[key]}`)
    .join("&");

  // Never log the private key or full signing payload in production.
  return signString(signOriginStr, telebirrConfig.privateKey);
}

export function createTimeStamp() {
  return Math.floor(Date.now() / 1000).toString();
}

export function createNonceStr() {
  return crypto.randomBytes(16).toString("hex").toUpperCase();
}
