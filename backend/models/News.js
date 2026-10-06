import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    summary: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    coverImage: {
      type: String,
      default: "",
    },

    videoUrl: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      enum: [
        "EIASC",
        "Hajj",
        "Islamic Affairs",
        "Youth",
        "Community",
        "Education",
        "Other",
      ],
      default: "Other",
    },

    author: {
      type: String,
      default: "EIASC",
      trim: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },{
   isFeatured: {
  type: Boolean,
  default: false,
},},
  {
    timestamps: true,
  },
);

const News = mongoose.model("News", newsSchema);

export default News; 