import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
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

    content: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      enum: [
        "hajj",
        "eiasc",
        "saudi",
        "guidance",
        "general",
      ],
      default: "general",
    },

    // YouTube video URL
    youtubeUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // Direct video URL
    videoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
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

const News = mongoose.model("News", newsSchema);

export default News;