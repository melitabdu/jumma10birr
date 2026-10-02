import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

/**
 * @desc Register normal user (role: donor)
 * @route POST /api/users/register
 * @access Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, phone, password } = req.body;

  const userExists = await User.findOne({ phone });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this phone number");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    fullName,
    phone,
    password: hashedPassword,
    role: "donor",
  });

  res.status(201).json({
    _id: user._id,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    token: generateToken(user._id),
  });
});

/**
 * @desc Login user
 * @route POST /api/users/login
 * @access Public
 */
export const authUser = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  const user = await User.findOne({ phone });

  if (!user) {
    res.status(400);
    throw new Error("Incorrect phone or password");
  }

  const passMatch = await bcrypt.compare(password, user.password);

  if (!passMatch) {
    res.status(400);
    throw new Error("Incorrect phone or password");
  }

  res.json({
    _id: user._id,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    mosqueCode: user.mosqueCode,
    token: generateToken(user._id),
  });
});

/**
 * @desc Get user profile
 * @route GET /api/users/profile
 * @access Private
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

/**
 * @desc Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.fullName = req.body.fullName || user.fullName;
  user.phone = req.body.phone || user.phone;
  user.email = req.body.email || user.email;

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    fullName: updatedUser.fullName,
    phone: updatedUser.phone,
    email: updatedUser.email,
    role: updatedUser.role,
  });
});

/**
 * @desc Admin: Get all users
 * @route GET /api/users
 * @access Private/Admin
 */
export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

/**
 * @desc Admin: Delete a user
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.deleteOne();
  res.json({ message: "User removed successfully" });
});

/**
 * @desc Admin: Register Mosque User (role: mosqueAdmin)
 * @route POST /api/users/mosque
 * @access Private/Admin
 */
export const registerMosqueUser = asyncHandler(async (req, res) => {
  const { fullName, phone, password, mosqueCode, email } = req.body;

  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    res.status(400);
    throw new Error("A user already exists with this phone number");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const mosqueUser = await User.create({
    fullName,
    phone,
    password: hashedPassword,
    role: "mosqueAdmin",
    mosqueCode,
    email,
  });

  res.status(201).json({
    _id: mosqueUser._id,
    fullName: mosqueUser.fullName,
    phone: mosqueUser.phone,
    role: mosqueUser.role,
    mosqueCode: mosqueUser.mosqueCode,
  });
});
