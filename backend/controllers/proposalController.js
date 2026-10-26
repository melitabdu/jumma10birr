
import mongoose from "mongoose";
import { cloudinary } from "../config/cloudinary.js";
import Proposal from "../models/proposal.js";

// =====================================
// UPLOAD FILES TO CLOUDINARY
// =====================================
const uploadFileToCloudinary = (file, fileType = "document") => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error("File or file buffer is missing."));
    }

    const isImage = fileType === "image";

    const fileName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/\.[^/.]+$/, "");

    const options = {
      resource_type: isImage ? "image" : "raw",
      folder: isImage ? "eiasc/project-images" : "eiasc/proposals",
      public_id: `${Date.now()}-${fileName}`,
    };

    console.log("Starting Cloudinary upload:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fileType,
      resource_type: options.resource_type,
    });

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload failed:", {
            message: error.message,
            http_code: error.http_code,
          });

          return reject(error);
        }

        if (!result?.secure_url) {
          return reject(
            new Error("Cloudinary did not return a secure file URL.")
          );
        }

        console.log("Cloudinary upload successful:", {
          public_id: result.public_id,
          secure_url: result.secure_url,
          resource_type: result.resource_type,
          format: result.format,
        });

        resolve(result);
      }
    );

    stream.on("error", (error) => {
      console.error("Cloudinary stream error:", error.message);
      reject(error);
    });

    stream.end(file.buffer);
  });
};

// =====================================
// FILE VALIDATION
// =====================================
const isAllowedDocument = (file) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  return Boolean(file && allowedTypes.includes(file.mimetype));
};

const isAllowedImage = (file) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  return Boolean(file && allowedTypes.includes(file.mimetype));
};

// =====================================
// HELPERS
// =====================================
const normalizeProgress = (value) => {
  const progress = Number(value);

  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.min(100, Math.max(0, progress));
};

const isAdmin = (req) => {
  return req.user?.role === "admin";
};

const normalizeStatus = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const status = value.trim().toLowerCase();

  return ["planned", "ongoing", "completed"].includes(status)
    ? status
    : null;
};

const logUploadError = (label, error) => {
  console.error(`========== ${label} ==========`);

  console.error("Message:", error.message);
  console.error("HTTP status:", error.http_code);
  console.error("Name:", error.name);

  console.error("==============================");
};

// =====================================
// UPLOAD NEW PROPOSAL
// =====================================
export const uploadProposal = async (req, res) => {
  try {
    console.log("========== PROPOSAL REQUEST ==========");
    console.log("Received file fields:", Object.keys(req.files || {}));
    console.log(
      "Proposal filename:",
      req.files?.proposalFile?.[0]?.originalname || "NOT RECEIVED"
    );
    console.log(
      "Image filename:",
      req.files?.imageFile?.[0]?.originalname || "NOT RECEIVED"
    );
    console.log("Received body fields:", Object.keys(req.body || {}));
    console.log("======================================");

    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const {
      title,
      description,
      status = "planned",
      progress = 0,
    } = req.body || {};

    const proposalFile = req.files?.proposalFile?.[0];
    const imageFile = req.files?.imageFile?.[0];

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    if (!proposalFile) {
      return res.status(400).json({
        success: false,
        message: "Proposal document is required.",
      });
    }

    if (!isAllowedDocument(proposalFile)) {
      return res.status(400).json({
        success: false,
        message: "Only PDF, DOC, DOCX, and TXT documents are allowed.",
        receivedMimeType: proposalFile.mimetype,
      });
    }

    if (imageFile && !isAllowedImage(imageFile)) {
      return res.status(400).json({
        success: false,
        message: "Only JPG, PNG, and WEBP project images are allowed.",
        receivedMimeType: imageFile.mimetype,
      });
    }

    const normalizedStatus = normalizeStatus(status);

    if (!normalizedStatus) {
      return res.status(400).json({
        success: false,
        message: "Status must be planned, ongoing, or completed.",
      });
    }

    const numericProgress = Number(progress);

    if (
      progress !== "" &&
      (!Number.isFinite(numericProgress) ||
        numericProgress < 0 ||
        numericProgress > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Progress must be between 0 and 100.",
      });
    }

    // Upload proposal document
    const documentResult = await uploadFileToCloudinary(
      proposalFile,
      "document"
    );

    // Upload optional project image
    let imageUrl = "";

    if (imageFile) {
      const imageResult = await uploadFileToCloudinary(
        imageFile,
        "image"
      );

      imageUrl = imageResult.secure_url;
    }

    // Save proposal in MongoDB
    const proposal = await Proposal.create({
      title: title.trim(),
      description: description.trim(),
      fileUrl: documentResult.secure_url,
      imageUrl,
      uploadedBy: req.user._id,
      status: normalizedStatus,
      progress: normalizeProgress(progress),
    });

    console.log("Proposal saved successfully:", proposal._id);

    return res.status(201).json({
      success: true,
      message: "Proposal uploaded successfully.",
      proposal,
    });
  } catch (error) {
    logUploadError("UPLOAD PROPOSAL ERROR", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload proposal.",
      error: error.message,
    });
  }
};

// =====================================
// GET ALL PROPOSALS
// =====================================
export const getProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: proposals.length,
      proposals,
    });
  } catch (error) {
    console.error("Get proposals error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch proposals.",
      error: error.message,
    });
  }
};

// =====================================
// GET PLANNED PROPOSALS
// =====================================
export const getPlannedProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({
      status: "planned",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: proposals.length,
      proposals,
    });
  } catch (error) {
    console.error("Get planned proposals error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch planned proposals.",
      error: error.message,
    });
  }
};

// =====================================
// GET ONGOING PROPOSALS
// =====================================
export const getOngoingProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({
      status: "ongoing",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: proposals.length,
      proposals,
    });
  } catch (error) {
    console.error("Get ongoing proposals error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch ongoing proposals.",
      error: error.message,
    });
  }
};

// =====================================
// GET COMPLETED PROPOSALS
// =====================================
export const getCompletedProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({
      status: "completed",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: proposals.length,
      proposals,
    });
  } catch (error) {
    console.error("Get completed proposals error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch completed proposals.",
      error: error.message,
    });
  }
};

// =====================================
// GET SINGLE PROPOSAL
// =====================================
export const getProposalById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid proposal ID.",
      });
    }

    const proposal = await Proposal.findById(id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found.",
      });
    }

    return res.status(200).json({
      success: true,
      proposal,
    });
  } catch (error) {
    console.error("Get proposal by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch proposal.",
      error: error.message,
    });
  }
};

// =====================================
// UPDATE PROPOSAL
// =====================================
export const updateProposal = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid proposal ID.",
      });
    }

    const proposal = await Proposal.findById(id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found.",
      });
    }

    const { title, description, status, progress } = req.body || {};

    const proposalFile = req.files?.proposalFile?.[0];
    const imageFile = req.files?.imageFile?.[0];

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty.",
        });
      }

      proposal.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Description cannot be empty.",
        });
      }

      proposal.description = description.trim();
    }

    if (status !== undefined) {
      const normalizedStatus = normalizeStatus(status);

      if (!normalizedStatus) {
        return res.status(400).json({
          success: false,
          message: "Status must be planned, ongoing, or completed.",
        });
      }

      proposal.status = normalizedStatus;
    }

    if (progress !== undefined) {
      const numericProgress = Number(progress);

      if (
        progress === "" ||
        !Number.isFinite(numericProgress) ||
        numericProgress < 0 ||
        numericProgress > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Progress must be between 0 and 100.",
        });
      }

      proposal.progress = normalizeProgress(progress);
    }

    // Replace document only if a new one was selected
    if (proposalFile) {
      if (!isAllowedDocument(proposalFile)) {
        return res.status(400).json({
          success: false,
          message: "Only PDF, DOC, DOCX, and TXT documents are allowed.",
          receivedMimeType: proposalFile.mimetype,
        });
      }

      const documentResult = await uploadFileToCloudinary(
        proposalFile,
        "document"
      );

      proposal.fileUrl = documentResult.secure_url;
    }

    // Replace image only if a new one was selected
    if (imageFile) {
      if (!isAllowedImage(imageFile)) {
        return res.status(400).json({
          success: false,
          message: "Only JPG, PNG, and WEBP images are allowed.",
          receivedMimeType: imageFile.mimetype,
        });
      }

      const imageResult = await uploadFileToCloudinary(
        imageFile,
        "image"
      );

      proposal.imageUrl = imageResult.secure_url;
    }

    await proposal.save();

    return res.status(200).json({
      success: true,
      message: "Proposal updated successfully.",
      proposal,
    });
  } catch (error) {
    logUploadError("UPDATE PROPOSAL ERROR", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update proposal.",
      error: error.message,
    });
  }
};

// =====================================
// DELETE PROPOSAL
// =====================================
export const deleteProposal = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid proposal ID.",
      });
    }

    const proposal = await Proposal.findById(id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found.",
      });
    }

    await proposal.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Proposal deleted successfully.",
    });
  } catch (error) {
    console.error("Delete proposal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete proposal.",
      error: error.message,
    });
  }
};
