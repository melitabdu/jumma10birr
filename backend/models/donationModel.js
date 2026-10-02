import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mosqueCode: { type: String, required: true },
    amount: { type: Number, required: true },
    donationType: { type: String, enum: ["Friday 10 Birr", "General"], default: "Friday 10 Birr" },
    paymentMethod: { type: String, enum: ["manual", "chapa", "telebirr", "other"], default: "manual" },
    transactionId: { type: String },
    txRef: { type: String },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    confirmed: { type: Boolean, default: false },
    email: { type: String },
    recurring: {
      isRecurring: { type: Boolean, default: true },
      frequency: { type: String, enum: ["weekly"], default: "weekly" },
      nextDonationDate: { type: Date }, // not required
    },
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
