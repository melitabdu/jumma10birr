import Announcement from "../models/Announcement.js";

// ==========================================
// CREATE ANNOUNCEMENT
// ==========================================
export const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      message,
      image,
      type,
      isPublished,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    const announcement = await Announcement.create({
      title,
      message,
      image: image || "",
      type: type || "general",
      isPublished: Boolean(isPublished),
      publishedAt: isPublished ? new Date() : null,
    });

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      announcement,
    });
  } catch (error) {
    console.error("Create announcement error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create announcement",
    });
  }
};

// ==========================================
// GET ALL ANNOUNCEMENTS
// ==========================================
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      announcements,
    });
  } catch (error) {
    console.error("Get announcements error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get announcements",
    });
  }
};

// ==========================================
// GET PUBLISHED ANNOUNCEMENTS
// ==========================================
export const getPublishedAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      isPublished: true,
    }).sort({ publishedAt: -1 });

    res.status(200).json({
      success: true,
      announcements,
    });
  } catch (error) {
    console.error(
      "Get published announcements error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get published announcements",
    });
  }
};

// ==========================================
// GET SINGLE ANNOUNCEMENT
// ==========================================
export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(
      req.params.id
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.status(200).json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error(
      "Get announcement error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get announcement",
    });
  }
};

// ==========================================
// UPDATE ANNOUNCEMENT
// ==========================================
export const updateAnnouncement = async (req, res) => {
  try {
    const announcement =
      await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    const wasPublished = announcement.isPublished;

    announcement.title =
      req.body.title ?? announcement.title;

    announcement.message =
      req.body.message ?? announcement.message;

    announcement.image =
      req.body.image ?? announcement.image;

    announcement.type =
      req.body.type ?? announcement.type;

    if (req.body.isPublished !== undefined) {
      announcement.isPublished =
        Boolean(req.body.isPublished);

      if (
        !wasPublished &&
        announcement.isPublished
      ) {
        announcement.publishedAt = new Date();
      }

      if (!announcement.isPublished) {
        announcement.publishedAt = null;
      }
    }

    await announcement.save();

    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      announcement,
    });
  } catch (error) {
    console.error(
      "Update announcement error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update announcement",
    });
  }
};

// ==========================================
// DELETE ANNOUNCEMENT
// ==========================================
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement =
      await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete announcement error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete announcement",
    });
  }
};