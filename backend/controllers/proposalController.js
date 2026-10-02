import { cloudinary } from "../config/cloudinary.js";
import Proposal from "../models/proposal.js";

// ================================
// CREATE / UPLOAD PROJECT (ADMIN)
// ================================
export const uploadProposal = async (req, res) => {
  try {
    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILE:", req.file);
    console.log("REQ.USER:", req.user);

    // Admin check
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    // File check
    if (!req.file) {
      return res.status(400).json({
        message: "Proposal file is required",
      });
    }

    const {
      title,
      description,
      status = "planned",
      progress = 0,
    } = req.body;

    // ==========================================
    // UPLOAD FILE BUFFER TO CLOUDINARY
    // ==========================================

    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            folder: "eiasc/proposals",
            public_id: `${Date.now()}-${req.file.originalname
              .replace(/\s+/g, "-")
              .replace(/\.[^/.]+$/, "")}`,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        stream.end(req.file.buffer);
      });
    };

    const cloudinaryResult = await uploadToCloudinary();

    console.log("CLOUDINARY RESULT:", cloudinaryResult);

    if (!cloudinaryResult?.secure_url) {
      return res.status(500).json({
        message: "Cloudinary upload failed",
      });
    }

    // ==========================================
    // CREATE DATABASE RECORD
    // ==========================================

    const proposal = await Proposal.create({
      title,
      description,
      fileUrl: cloudinaryResult.secure_url,
      uploadedBy: req.user._id,
      status: status.toLowerCase(),
      progress: Math.min(
        100,
        Math.max(0, Number(progress))
      ),
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(201).json({
      message: "Project uploaded successfully",
      proposal,
    });
  } catch (err) {
    console.error("UPLOAD PROPOSAL ERROR FULL:", err);

    res.status(500).json({
      message: "Failed to upload project",
      error: err.message,
    });
  }
};

// ================================
// GET ALL PROJECTS (PUBLIC)
// ================================
export const getProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find()
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name email role");

    res.status(200).json({
      proposals,
    });
  } catch (err) {
    console.error("GET PROPOSALS ERROR:", err);

    res.status(500).json({
      message: "Failed to fetch projects",
    });
  }
};

// ================================
// GET ONGOING PROJECTS (PUBLIC)
// ================================
export const getOngoingProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({
      status: "ongoing",
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      proposals,
    });
  } catch (err) {
    console.error("GET ONGOING ERROR:", err);

    res.status(500).json({
      message: "Failed to fetch ongoing projects",
    });
  }
};

// ================================
// UPDATE PROJECT (ADMIN)
// ================================
export const updateProposal = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const {
      title,
      description,
      status,
      progress,
    } = req.body;

    if (title !== undefined) {
      proposal.title = title;
    }

    if (description !== undefined) {
      proposal.description = description;
    }

    if (status !== undefined) {
      proposal.status = status.toLowerCase();
    }

    if (progress !== undefined) {
      proposal.progress = Math.min(
        100,
        Math.max(0, Number(progress))
      );
    }

    // ==========================================
    // OPTIONAL FILE UPDATE
    // ==========================================

    if (req.file) {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "raw",
              folder: "eiasc/proposals",
              public_id: `${Date.now()}-${req.file.originalname
                .replace(/\s+/g, "-")
                .replace(/\.[^/.]+$/, "")}`,
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          stream.end(req.file.buffer);
        });
      };

      const cloudinaryResult = await uploadToCloudinary();

      if (!cloudinaryResult?.secure_url) {
        return res.status(500).json({
          message: "Cloudinary file update failed",
        });
      }

      proposal.fileUrl = cloudinaryResult.secure_url;
    }

    await proposal.save();

    res.status(200).json({
      message: "Project updated successfully",
      proposal,
    });
  } catch (err) {
    console.error("UPDATE PROPOSAL ERROR:", err);

    res.status(500).json({
      message: "Failed to update project",
      error: err.message,
    });
  }
};

// ================================
// DELETE PROJECT (ADMIN)
// ================================
export const deleteProposal = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    await proposal.deleteOne();

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (err) {
    console.error("DELETE PROPOSAL ERROR:", err);

    res.status(500).json({
      message: "Failed to delete project",
      error: err.message,
    });
  }
};