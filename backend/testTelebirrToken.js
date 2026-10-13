
import applyFabricToken from "./services/applyFabricToken.js";

try {
  const result = await applyFabricToken();

  console.log("Telebirr token response:", {
    code: result.code,
    message: result.message,
    success: result.success,
    hasToken: Boolean(
      result.token ||
      result.accessToken ||
      result.data?.token
    ),
  });
} catch (error) {
  console.error("Token request failed:", {
    status: error.response?.status,
    data: error.response?.data,
    message: error.message,
  });
}
