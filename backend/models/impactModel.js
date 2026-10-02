import mongoose from "mongoose";

const ImpactSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },      // e.g. "Mosques Built"
    count: { type: Number, default: 0 },          // e.g. 25
    icon: { type: String, default: "" },          // e.g. "mosque", "water", "students"
    // You can later store icon name, image, or import string here
  },
  { timestamps: true }
);

const Impact = mongoose.model("Impact", ImpactSchema);

export default Impact;
