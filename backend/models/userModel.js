import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["donor","mosqueAdmin","admin"], default: "donor" },
    mosqueCode: { type: String },
    email: { type: String }, // optional, used for Chapa/receipts
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
