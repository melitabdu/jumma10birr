import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log(
      "Push notifications require a physical device."
    );

    return null;
  }

  const {
    status: existingStatus,
  } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const {
      status,
    } = await Notifications.requestPermissionsAsync();

    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log(
      "Notification permission was not granted."
    );

    return null;
  }

  const tokenResponse =
    await Notifications.getExpoPushTokenAsync();

  const token = tokenResponse.data;

  console.log(
    "Expo Push Token:",
    token
  );

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(
      "default",
      {
        name: "default",
        importance:
          Notifications.AndroidImportance.MAX,

        vibrationPattern: [
          0,
          250,
          250,
          250,
        ],

        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
      }
    );
  }

  return token;
}