import mongoose from "mongoose";

const pushSubscriptionSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    platform: {
      type: String,
      enum: ["android", "ios", "web", "unknown"],
      default: "unknown",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastRegisteredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const PushSubscription = mongoose.model(
  "PushSubscription",
  pushSubscriptionSchema
);

export default PushSubscription;