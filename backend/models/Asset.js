import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    documentType: {
      type: String,
      enum: [
        "ownership",
        "purchase",
        "donation",
        "lease",
        "registration",
        "inspection",
        "photo",
        "other",
      ],
      default: "other",
    },

    url: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      default: "",
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const AssetSchema = new mongoose.Schema(
  {
    // ==============================
    // 1. ASSET IDENTIFICATION
    // ==============================

    assetId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "land",
        "building",
        "vehicle",
        "equipment",
        "furniture",
        "it_equipment",
        "religious_asset",
        "financial_asset",
        "other",
      ],
    },

    subCategory: {
      type: String,
      default: "",
      trim: true,
    },

    // ==============================
    // 2. ACQUISITION
    // ==============================

    acquisitionMethod: {
      type: String,
      enum: [
        "purchased",
        "donated",
        "constructed",
        "transferred",
        "inherited",
        "waqf",
        "government_allocated",
        "other",
      ],
    },

    acquisitionDate: {
      type: Date,
    },

    acquisitionCost: {
      type: Number,
      min: 0,
    },

    currency: {
      type: String,
      default: "ETB",
    },

    // ==============================
    // 3. OWNERSHIP
    // ==============================

    ownershipType: {
      type: String,
      enum: [
        "owned",
        "leased",
        "donated",
        "waqf",
        "government_allocated",
        "other",
      ],
    },

    legalOwner: {
      type: String,
      default: "",
      trim: true,
    },

    ownershipDocumentNumber: {
      type: String,
      default: "",
      trim: true,
    },

    // ==============================
    // 4. LOCATION
    // ==============================

    location: {
      region: {
        type: String,
        default: "",
        trim: true,
      },

      city: {
        type: String,
        default: "",
        trim: true,
      },

      zone: {
        type: String,
        default: "",
        trim: true,
      },

      woreda: {
        type: String,
        default: "",
        trim: true,
      },

      kebele: {
        type: String,
        default: "",
        trim: true,
      },

      specificLocation: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // ==============================
    // 5. RESPONSIBILITY
    // ==============================

    responsibleDepartment: {
      type: String,
      default: "",
      trim: true,
    },

    responsibleOffice: {
      type: String,
      default: "",
      trim: true,
    },

    responsiblePerson: {
      type: String,
      default: "",
      trim: true,
    },

    // ==============================
    // 6. STATUS AND CONDITION
    // ==============================

    condition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor", "damaged"],
      default: "good",
    },

    status: {
      type: String,
      enum: [
        "active",
        "under_maintenance",
        "missing",
        "transferred",
        "disposed",
        "archived",
      ],
      default: "active",
    },

    // ==============================
    // 7. VALUE
    // ==============================

    estimatedValue: {
      type: Number,
      min: 0,
    },

    valuationDate: {
      type: Date,
    },

    // ==============================
    // 8. CATEGORY-SPECIFIC DATA
    // ==============================

    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ==============================
    // 9. DOCUMENTS
    // ==============================

    documents: [documentSchema],

    // ==============================
    // 10. VERIFICATION
    // ==============================

    lastVerifiedAt: {
      type: Date,
    },

    lastVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    verificationStatus: {
      type: String,
      enum: [
        "not_verified",
        "verified",
        "requires_investigation",
      ],
      default: "not_verified",
    },

    // ==============================
    // 11. SYSTEM INFORMATION
    // ==============================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

const Asset = mongoose.model("Asset", AssetSchema);

export default Asset;