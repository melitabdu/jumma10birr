import News from "../models/newsModel.js";

// ==========================================
// CREATE NEWS
// ==========================================

export const createNews = async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      image,
      category,
      youtubeUrl,
      videoUrl,
      isFeatured,
      isPublished,
    } = req.body;

    // Basic validation
    if (!title || !description || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, description and content are required",
      });
    }

    const news = await News.create({
      title,
      description,
      content,
      image: image || "",
      category: category || "general",
      youtubeUrl: youtubeUrl || "",
      videoUrl: videoUrl || "",
      isFeatured: isFeatured || false,
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : null,
    });

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

// ==========================================
// GET ALL NEWS - ADMIN
// ==========================================

export const getNews = async (req, res) => {
  try {
    const news = await News.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      news,
    });
  } catch (error) {
    console.error("Get news error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get news",
      error: error.message,
    });
  }
};

// ==========================================
// GET PUBLISHED NEWS - MOBILE APP
// ==========================================

export const getPublishedNews = async (req, res) => {
  try {
    const news = await News.find({
      isPublished: true,
    }).sort({
      publishedAt: -1,
    });

    res.status(200).json({
      success: true,
      news,
    });
  } catch (error) {
    console.error("Get published news error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get published news",
      error: error.message,
    });
  }
};

// ==========================================
// GET FEATURED NEWS - MOBILE APP
// ==========================================

export const getFeaturedNews = async (req, res) => {
  try {
    const news = await News.find({
      isPublished: true,
      isFeatured: true,
    }).sort({
      publishedAt: -1,
    });

    res.status(200).json({
      success: true,
      news,
    });
  } catch (error) {
    console.error("Get featured news error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get featured news",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE NEWS
// ==========================================

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
      message: "Failed to get news",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE NEWS
// ==========================================

export const updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    const {
      title,
      description,
      content,
      image,
      category,
      youtubeUrl,
      videoUrl,
      isFeatured,
      isPublished,
    } = req.body;

    news.title = title ?? news.title;
    news.description = description ?? news.description;
    news.content = content ?? news.content;
    news.image = image ?? news.image;
    news.category = category ?? news.category;
    news.youtubeUrl = youtubeUrl ?? news.youtubeUrl;
    news.videoUrl = videoUrl ?? news.videoUrl;
    news.isFeatured = isFeatured ?? news.isFeatured;

    // Handle publishing
    if (
      isPublished !== undefined &&
      isPublished !== news.isPublished
    ) {
      news.isPublished = isPublished;

      news.publishedAt = isPublished
        ? new Date()
        : null;
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

// ==========================================
// DELETE NEWS
// ==========================================

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