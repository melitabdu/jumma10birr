import News from "../models/News.js";
import { uploadToCloudinary } from "../services/cloudinaryUpload.js";


// CREATE NEWS
export const createNews = async (req, res) => {
  try {
    const {
      title,
      summary,
      content,
      category,
      author,
      isPublished,
      isFeatured,
      videoType,
      youtubeUrl,
      tiktokUrl,
    } = req.body;

    if (!title || !summary || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, summary and content are required",
      });
    }

    let coverImage = "";
    let videoUrl = "";

    // ================================
    // UPLOAD COVER IMAGE
    // ================================

    if (req.files?.coverImage?.[0]) {
      const imageFile = req.files.coverImage[0];

      const result = await uploadToCloudinary(
        imageFile.buffer,
        "eiasc/news/images",
        "image"
      );

      coverImage = result.secure_url;
    }

    // ================================
    // UPLOAD VIDEO
    // ================================

    if (
      videoType === "upload" &&
      req.files?.video?.[0]
    ) {
      const videoFile = req.files.video[0];

      const result = await uploadToCloudinary(
        videoFile.buffer,
        "eiasc/news/videos",
        "video"
      );

      videoUrl = result.secure_url;
    }

    // ================================
    // PUBLISH / FEATURED STATUS
    // ================================

    const published =
      isPublished === true ||
      isPublished === "true";

    const featured =
      isFeatured === true ||
      isFeatured === "true";

    // ================================
    // CREATE NEWS
    // ================================

    const news = await News.create({
      title,
      summary,
      content,

      coverImage,

      videoType: videoType || "none",

      videoUrl:
        videoType === "upload"
          ? videoUrl
          : "",

      youtubeUrl:
        videoType === "youtube"
          ? youtubeUrl || ""
          : "",

      tiktokUrl:
        videoType === "tiktok"
          ? tiktokUrl || ""
          : "",

      category: category || "Other",

      author: author || "EIASC",

      isPublished: published,

      isFeatured: featured,

      publishedAt:
        published
          ? new Date()
          : null,
    });

    // ================================
    // RESPONSE
    // ================================

    res.status(201).json({
      success: true,
      message: "News created successfully",
      news,
    });

  } catch (error) {

    console.error("Create news error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create news",
      error: error.message,
    });
  }
};

// GET ALL NEWS
export const getNews = async (req, res) => {
  try {
    const news = await News.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: news.length,
      news,
    });
  } catch (error) {
    console.error("Get news error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch news",
      error: error.message,
    });
  }
};

// GET PUBLISHED NEWS
export const getPublishedNews = async (req, res) => {
  try {
    const news = await News.find({
      isPublished: true,
    }).sort({
      publishedAt: -1,
    });

    res.status(200).json({
      success: true,
      count: news.length,
      news,
    });
  } catch (error) {
    console.error("Get published news error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch published news",
      error: error.message,
    });
  }
};

// GET SINGLE NEWS
export const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    res.status(200).json({
      success: true,
      news,
    });
  } catch (error) {
    console.error("Get news by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch news",
      error: error.message,
    });
  }
};

// UPDATE NEWS
export const updateNews = async (req, res) => {
  try {
    const {
      title,
      summary,
      content,
      coverImage,
      videoUrl,
      category,
      author,
      isPublished,
    } = req.body;

    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    const publishing =
      isPublished === true || isPublished === "true";

    news.title = title ?? news.title;
    news.summary = summary ?? news.summary;
    news.content = content ?? news.content;
    news.coverImage = coverImage ?? news.coverImage;
    news.videoUrl = videoUrl ?? news.videoUrl;
    news.category = category ?? news.category;
    news.author = author ?? news.author;

    if (typeof isPublished !== "undefined") {
      news.isPublished = publishing;

      if (publishing && !news.publishedAt) {
        news.publishedAt = new Date();
      }

      if (!publishing) {
        news.publishedAt = null;
      }
    }

    await news.save();

    res.status(200).json({
      success: true,
      message: "News updated successfully",
      news,
    });
  } catch (error) {
    console.error("Update news error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update news",
      error: error.message,
    });
  }
};

// DELETE NEWS
export const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    await News.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "News deleted successfully",
    });
  } catch (error) {
    console.error("Delete news error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete news",
      error: error.message,
    });
  }
};
export const getFeaturedNews = async (req, res) => {
  try {
    const news = await News.find({
      isPublished: true,
      isFeatured: true,
    })
      .sort({ publishedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      count: news.length,
      news,
    });
  } catch (error) {
    console.error("Get featured news error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch featured news",
      error: error.message,
    });
  }
};