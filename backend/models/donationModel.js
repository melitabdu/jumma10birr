
import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    outTradeNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    donorName: {
      type: String,
      default: "Anonymous",
      maxlength: 100,
    },
    donationType: {
      type: String,
      default: "Sadaqah",
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    paidAt: {
      type: Date,
      default: null,
    },
    gatewayTransactionId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const Donation =
  mongoose.models.Donation ||
  mongoose.model("Donation", donationSchema);
