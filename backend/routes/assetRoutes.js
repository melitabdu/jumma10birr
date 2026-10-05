import express from "express";

import {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  restoreAsset,
  permanentlyDeleteAsset,
  getAssetStats,
} from "../controllers/assetController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
==================================================
ASSET DASHBOARD STATISTICS
==================================================

GET /api/assets/dashboard/stats

Must be placed BEFORE /:id
*/

router.get(
  "/dashboard/stats",
  protect,
  admin,
  getAssetStats
);

/*
==================================================
CREATE / REGISTER ASSET
==================================================

POST /api/assets

Only authenticated admins
*/

router.post(
  "/",
  protect,
  admin,
  createAsset
);

/*
==================================================
GET ALL ASSETS
==================================================

GET /api/assets

Supports:

/api/assets?category=land

/api/assets?status=active

/api/assets?condition=good

/api/assets?region=Addis Ababa

/api/assets?search=mosque

/api/assets?page=1&limit=20
*/

router.get(
  "/",
  protect,
  admin,
  getAssets
);

/*
==================================================
GET SINGLE ASSET
==================================================

GET /api/assets/:id
*/

router.get(
  "/:id",
  protect,
  admin,
  getAssetById
);

/*
==================================================
UPDATE ASSET
==================================================

PUT /api/assets/:id
*/

router.put(
  "/:id",
  protect,
  admin,
  updateAsset
);

/*
==================================================
ARCHIVE ASSET
==================================================

DELETE /api/assets/:id

This does NOT permanently delete the asset.
It sets:

isDeleted = true
status = archived
*/

router.delete(
  "/:id",
  protect,
  admin,
  deleteAsset
);

/*
==================================================
RESTORE ARCHIVED ASSET
==================================================

PUT /api/assets/:id/restore
*/

router.put(
  "/:id/restore",
  protect,
  admin,
  restoreAsset
);

/*
==================================================
PERMANENTLY DELETE ASSET
==================================================

DELETE /api/assets/:id/permanent

Use carefully.
*/

router.delete(
  "/:id/permanent",
  protect,
  admin,
  permanentlyDeleteAsset
);

export default router;