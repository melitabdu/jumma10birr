import asyncHandler from "express-async-handler";
import Asset from "../models/Asset.js";

/*
==================================================
ASSET ID PREFIXES
==================================================
*/

const categoryPrefixes = {
  land: "L",
  building: "B",
  vehicle: "V",
  equipment: "EQ",
  furniture: "F",
  it_equipment: "IT",
  religious_asset: "RA",
  financial_asset: "FA",
  other: "OT",
};

/*
==================================================
GENERATE ASSET ID
==================================================
*/

const generateAssetId = async (category) => {
  const prefix = categoryPrefixes[category] || "OT";

  const lastAsset = await Asset.findOne({
    category,
  }).sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastAsset?.assetId) {
    const numberPart = lastAsset.assetId.split("-").pop();

    const parsedNumber = parseInt(numberPart, 10);

    if (!isNaN(parsedNumber)) {
      nextNumber = parsedNumber + 1;
    }
  }

  return `EIASC-${prefix}-${String(nextNumber).padStart(6, "0")}`;
};

/*
==================================================
CREATE / REGISTER ASSET
==================================================
POST /api/assets
*/

export const createAsset = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    subCategory,
    acquisitionMethod,
    acquisitionDate,
    acquisitionCost,
    currency,
    ownershipType,
    legalOwner,
    ownershipDocumentNumber,
    location,
    responsibleDepartment,
    responsibleOffice,
    responsiblePerson,
    condition,
    status,
    estimatedValue,
    valuationDate,
    specifications,
    documents,
  } = req.body;

  if (!name || !category) {
    res.status(400);
    throw new Error("Asset name and category are required");
  }

  const assetId = await generateAssetId(category);

  const asset = await Asset.create({
    assetId,
    name,
    description,
    category,
    subCategory,
    acquisitionMethod,
    acquisitionDate,
    acquisitionCost,
    currency,
    ownershipType,
    legalOwner,
    ownershipDocumentNumber,
    location,
    responsibleDepartment,
    responsibleOffice,
    responsiblePerson,
    condition,
    status,
    estimatedValue,
    valuationDate,
    specifications,
    documents,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Asset registered successfully",
    asset,
  });
});

/*
==================================================
GET ALL ASSETS
==================================================
GET /api/assets
==================================================
*/

export const getAssets = asyncHandler(async (req, res) => {
  const {
    category,
    status,
    condition,
    region,
    search,
    page = 1,
    limit = 20,
  } = req.query;

  const filter = {
    isDeleted: false,
  };

  if (category) {
    filter.category = category;
  }

  if (status) {
    filter.status = status;
  }

  if (condition) {
    filter.condition = condition;
  }

  if (region) {
    filter["location.region"] = region;
  }

  if (search) {
    filter.$or = [
      {
        assetId: {
          $regex: search,
          $options: "i",
        },
      },
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
      {
        subCategory: {
          $regex: search,
          $options: "i",
        },
      },
      {
        "location.region": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "location.city": {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const [assets, total] = await Promise.all([
    Asset.find(filter)
      .populate("createdBy", "fullName phone role")
      .populate("lastVerifiedBy", "fullName phone role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),

    Asset.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    assets,

    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  });
});

/*
==================================================
GET SINGLE ASSET
==================================================
GET /api/assets/:id
==================================================
*/

export const getAssetById = asyncHandler(async (req, res) => {
  const asset = await Asset.findOne({
    _id: req.params.id,
    isDeleted: false,
  })
    .populate("createdBy", "fullName phone role")
    .populate("lastVerifiedBy", "fullName phone role");

  if (!asset) {
    res.status(404);
    throw new Error("Asset not found");
  }

  res.status(200).json({
    success: true,
    asset,
  });
});

/*
==================================================
UPDATE ASSET
==================================================
PUT /api/assets/:id
==================================================
*/

export const updateAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!asset) {
    res.status(404);
    throw new Error("Asset not found");
  }

  const allowedFields = [
    "name",
    "description",
    "category",
    "subCategory",
    "acquisitionMethod",
    "acquisitionDate",
    "acquisitionCost",
    "currency",
    "ownershipType",
    "legalOwner",
    "ownershipDocumentNumber",
    "location",
    "responsibleDepartment",
    "responsibleOffice",
    "responsiblePerson",
    "condition",
    "status",
    "estimatedValue",
    "valuationDate",
    "specifications",
    "documents",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      asset[field] = req.body[field];
    }
  });

  const updatedAsset = await asset.save();

  res.status(200).json({
    success: true,
    message: "Asset updated successfully",
    asset: updatedAsset,
  });
});

/*
==================================================
ARCHIVE ASSET
==================================================
DELETE /api/assets/:id
==================================================
*/

export const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!asset) {
    res.status(404);
    throw new Error("Asset not found");
  }

  asset.isDeleted = true;
  asset.status = "archived";

  await asset.save();

  res.status(200).json({
    success: true,
    message: "Asset archived successfully",
  });
});

/*
==================================================
RESTORE ASSET
==================================================
PUT /api/assets/:id/restore
==================================================
*/

export const restoreAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findOne({
    _id: req.params.id,
    isDeleted: true,
  });

  if (!asset) {
    res.status(404);
    throw new Error("Archived asset not found");
  }

  asset.isDeleted = false;
  asset.status = "active";

  await asset.save();

  res.status(200).json({
    success: true,
    message: "Asset restored successfully",
    asset,
  });
});

/*
==================================================
PERMANENT DELETE
==================================================
DELETE /api/assets/:id/permanent
==================================================
*/

export const permanentlyDeleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    res.status(404);
    throw new Error("Asset not found");
  }

  await Asset.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Asset permanently deleted",
  });
});

/*
==================================================
ASSET DASHBOARD STATISTICS
==================================================
GET /api/assets/dashboard/stats
==================================================
*/

export const getAssetStats = asyncHandler(async (req, res) => {
  const baseFilter = {
    isDeleted: false,
  };

  const [
    totalAssets,
    activeAssets,
    missingAssets,
    assetsUnderMaintenance,
    totalEstimatedValue,
    assetsByCategory,
    assetsByCondition,
    assetsByRegion,
  ] = await Promise.all([
    Asset.countDocuments(baseFilter),

    Asset.countDocuments({
      ...baseFilter,
      status: "active",
    }),

    Asset.countDocuments({
      ...baseFilter,
      status: "missing",
    }),

    Asset.countDocuments({
      ...baseFilter,
      status: "under_maintenance",
    }),

    Asset.aggregate([
      {
        $match: baseFilter,
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $ifNull: ["$estimatedValue", 0],
            },
          },
        },
      },
    ]),

    Asset.aggregate([
      {
        $match: baseFilter,
      },
      {
        $group: {
          _id: "$category",
          count: {
            $sum: 1,
          },
          totalValue: {
            $sum: {
              $ifNull: ["$estimatedValue", 0],
            },
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]),

    Asset.aggregate([
      {
        $match: baseFilter,
      },
      {
        $group: {
          _id: "$condition",
          count: {
            $sum: 1,
          },
        },
      },
    ]),

    Asset.aggregate([
      {
        $match: baseFilter,
      },
      {
        $group: {
          _id: "$location.region",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]),
  ]);

  res.status(200).json({
    success: true,

    summary: {
      totalAssets,
      activeAssets,
      missingAssets,
      assetsUnderMaintenance,
      totalEstimatedValue:
        totalEstimatedValue[0]?.total || 0,
    },

    assetsByCategory,
    assetsByCondition,
    assetsByRegion,
  });
});