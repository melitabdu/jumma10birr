import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    // Admin uploads project
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    status: {
      type: String,
      enum: ["planned", "ongoing", "completed"],
      default: "planned",
      lowercase: true,
      trim: true,
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Proposal", proposalSchema);
