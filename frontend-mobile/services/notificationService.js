import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import axios from "axios";

// Show notifications when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Your deployed EIASC backend
const API_URL = "https://jumma10birr-eiasc.onrender.com";

export async function registerForPushNotificationsAsync() {
  try {
    // Push notifications require a physical device
    if (!Device.isDevice) {
      console.log(
        "⚠️ Push notifications require a physical device."
      );
      return null;
    }

    // Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#2E8B57",
      });
    }

    // Check notification permission
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    // Ask user for permission
    if (existingStatus !== "granted") {
      const { status } =
        await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("❌ Notification permission denied.");
      return null;
    }

    // Get EAS project ID
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      console.log("❌ EAS project ID not found.");
      return null;
    }

    // Get Expo Push Token
    const token =
      await Notifications.getExpoPushTokenAsync({
        projectId,
      });

    console.log("✅ Expo Push Token:", token.data);

    // Register this device with EIASC backend
    try {
      const response = await axios.post(
        `${API_URL}/api/notifications/register`,
        {
          token: token.data,
          platform: Platform.OS,
        }
      );

      console.log(
        "✅ Device registered for public notifications:",
        response.data.message
      );
    } catch (error) {
      console.error(
        "❌ Failed to register device with backend:",
        error.response?.data || error.message
      );
    }

    return token.data;
  } catch (error) {
    console.error(
      "❌ Notification registration failed:",
      error
    );

    return null;
  }
}