
import axios from "axios";
import { telebirrConfig } from "../config/telebirrConfig.js";

export default async function applyFabricToken() {
  const response = await axios.post(
    `${telebirrConfig.baseUrl}/payment/v1/token`,
    {
      appSecret: telebirrConfig.appSecret,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-APP-Key": telebirrConfig.fabricAppId,
      },
      timeout: 15000,
    }
  );

  return response.data;
}
