import PushSubscription from "../models/PushSubscription.js";

/**
 * =========================================================
 * REGISTER PUSH TOKEN
 * =========================================================
 *
 * Saves or updates an Expo push token.
 *
 * Expected body:
 * {
 *   token: "ExponentPushToken[xxxxxxxxxxxx]",
 *   platform: "android"
 * }
 */
const registerPushToken = async (req, res) => {
  try {
    const { token, platform } = req.body;

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!token || !token.trim()) {
      return res.status(400).json({
        success: false,
        message: "Push token is required.",
      });
    }

    // -----------------------------------------------------
    // FIND EXISTING TOKEN
    // -----------------------------------------------------

    const existingSubscription = await PushSubscription.findOne({
      token: token.trim(),
    });

    // -----------------------------------------------------
    // UPDATE EXISTING TOKEN
    // -----------------------------------------------------

    if (existingSubscription) {
      existingSubscription.platform = platform || "unknown";
      existingSubscription.isActive = true;
      existingSubscription.lastRegisteredAt = new Date();

      await existingSubscription.save();

      return res.status(200).json({
        success: true,
        message: "Push token updated successfully.",
        subscription: existingSubscription,
      });
    }

    // -----------------------------------------------------
    // CREATE NEW TOKEN
    // -----------------------------------------------------

    const subscription = await PushSubscription.create({
      token: token.trim(),
      platform: platform || "unknown",
      isActive: true,
      lastRegisteredAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Push token registered successfully.",
      subscription,
    });
  } catch (error) {
    console.error("Register push token error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register push token.",
      error: error.message,
    });
  }
};

/**
 * =========================================================
 * SEND PUSH NOTIFICATION
 * =========================================================
 *
 * Sends a notification to all active saved Expo push tokens.
 *
 * Expected body:
 * {
 *   title: "Hajj Registration",
 *   message: "Hajj registration is now open."
 * }
 */
const sendPushNotification = async (req, res) => {
  try {
    const { title, message } = req.body;

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notification title is required.",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notification message is required.",
      });
    }

    // -----------------------------------------------------
    // GET ACTIVE TOKENS
    // -----------------------------------------------------

    const subscriptions = await PushSubscription.find({
      isActive: true,
    }).select("token");

    if (!subscriptions.length) {
      return res.status(404).json({
        success: false,
        message: "No active push notification tokens were found.",
      });
    }

    const tokens = subscriptions
      .map((subscription) => subscription.token)
      .filter(Boolean);

    if (!tokens.length) {
      return res.status(404).json({
        success: false,
        message: "No valid push notification tokens were found.",
      });
    }

    // -----------------------------------------------------
    // CREATE EXPO MESSAGES
    // -----------------------------------------------------

    const messages = tokens.map((token) => ({
      to: token,
      sound: "default",
      title: title.trim(),
      body: message.trim(),

      data: {
        type: "admin_notification",
      },
    }));

    // -----------------------------------------------------
    // EXPO ACCEPTS BATCHES
    // -----------------------------------------------------

    const chunkSize = 100;
    const chunks = [];

    for (let i = 0; i < messages.length; i += chunkSize) {
      chunks.push(messages.slice(i, i + chunkSize));
    }

    let sent = 0;
    let failed = 0;

    const expoResponses = [];

    // -----------------------------------------------------
    // SEND EACH CHUNK
    // -----------------------------------------------------

    for (const chunk of chunks) {
      try {
        const response = await fetch(
          "https://exp.host/--/api/v2/push/send",
          {
            method: "POST",

            headers: {
              Accept: "application/json",
              "Accept-encoding": "gzip, deflate",
              "Content-Type": "application/json",
            },

            body: JSON.stringify(chunk),
          }
        );

        const data = await response.json();

        expoResponses.push(data);

        if (response.ok) {
          sent += chunk.length;
        } else {
          failed += chunk.length;
        }
      } catch (error) {
        console.error(
          "Expo push notification error:",
          error.message
        );

        failed += chunk.length;
      }
    }

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        failed > 0
          ? "Notification was sent with some failures."
          : "Notification sent successfully.",

      totalTokens: tokens.length,
      sent,
      failed,

      expoResponses,
    });
  } catch (error) {
    console.error(
      "Send notification controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to send notification.",
      error: error.message,
    });
  }
};

// ---------------------------------------------------------
// ES MODULE EXPORT
// ---------------------------------------------------------

export {
  registerPushToken,
  sendPushNotification,
};