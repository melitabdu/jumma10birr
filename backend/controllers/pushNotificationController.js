import PushSubscription from "../models/PushSubscription.js";

/**
 * Register a device for public EIASC push notifications.
 * No login is required.
 */
export const registerPushSubscription = async (req, res) => {
  try {
    const { token, platform } = req.body;

    // Validate token
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Push notification token is required.",
      });
    }

    // Check whether this device/token already exists
    let subscription = await PushSubscription.findOne({
      token,
    });

    if (subscription) {
      // Reactivate/update existing subscription
      subscription.platform = platform || subscription.platform;
      subscription.isActive = true;
      subscription.lastRegisteredAt = new Date();

      await subscription.save();

      return res.status(200).json({
        success: true,
        message: "Push subscription updated successfully.",
        data: subscription,
      });
    }

    // Create new subscription
    subscription = await PushSubscription.create({
      token,
      platform: platform || "unknown",
      isActive: true,
      lastRegisteredAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Push subscription registered successfully.",
      data: subscription,
    });
  } catch (error) {
    console.error(
      "❌ Register push subscription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to register push subscription.",
      error: error.message,
    });
  }
};