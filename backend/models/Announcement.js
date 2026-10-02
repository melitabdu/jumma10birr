import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: ["general", "important", "event", "emergency"],
      default: "general",
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Announcement = mongoose.model(
  "Announcement",
  announcementSchema
);

export default Announcement;