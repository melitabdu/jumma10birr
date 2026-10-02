import asyncHandler from "express-async-handler";
import Impact from "../models/impactModel.js";

// @desc    Get all impact items (public)
// @route   GET /api/impact
// @access  Public
export const getImpactItems = asyncHandler(async (req, res) => {
  const items = await Impact.find().sort({ createdAt: -1 });
  res.status(200).json(items);
});

// @desc    Create new impact item
// @route   POST /api/impact
// @access  Admin
export const createImpactItem = asyncHandler(async (req, res) => {
  const { title, count, icon } = req.body;

  if (!title || count === undefined) {
    res.status(400);
    throw new Error("Title and Count are required");
  }

  const newItem = await Impact.create({ title, count, icon });
  res.status(201).json(newItem);
});

// @desc    Update impact item
// @route   PUT /api/impact/:id
// @access  Admin
export const updateImpactItem = asyncHandler(async (req, res) => {
  const { title, count, icon } = req.body;
  const item = await Impact.findById(req.params.id);

  if (!item) {
    res.status(404);
    throw new Error("Impact item not found");
  }

  item.title = title || item.title;
  item.count = count !== undefined ? count : item.count;
  item.icon = icon || item.icon;

  const updatedItem = await item.save();
  res.status(200).json(updatedItem);
});

// @desc    Delete impact item
// @route   DELETE /api/impact/:id
// @access  Admin
export const deleteImpactItem = asyncHandler(async (req, res) => {
  const item = await Impact.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Impact item not found");
  }
  await item.remove();
  res.status(200).json({ message: "Impact item removed" });
});
