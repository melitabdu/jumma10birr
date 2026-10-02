import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

/**
 * @desc Register admin (can register multiple admins now)
 * @route POST /api/admin/register
 * @access Public
 */
export const registerAdmin = asyncHandler(async (req, res) => {
  const { fullName, phone, password } = req.body;

  // Check if phone already exists
  const existingAdmin = await User.findOne({ phone, role: "admin" });
  if (existingAdmin) {
    res.status(400);
    throw new Error("Admin with this phone already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create admin user
  const admin = await User.create({
    fullName,
    phone,
    password: hashedPassword,
    role: "admin",
  });

  res.status(201).json({
    message: "Admin registered successfully",
    admin: {
      id: admin._id,
      fullName: admin.fullName,
      phone: admin.phone,
      role: admin.role,
    },
    token: generateToken(admin._id),
  });
});

/**
 * @desc Admin login
 * @route POST /api/admin/login
 * @access Public
 */
export const loginAdmin = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  // Find admin by phone
  const admin = await User.findOne({ phone, role: "admin" });
  if (!admin) {
    res.status(401);
    throw new Error("Admin not found");
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid password");
  }

  // Return admin data with token
  res.json({
    _id: admin._id,
    fullName: admin.fullName,
    phone: admin.phone,
    role: admin.role,
    token: generateToken(admin._id),
  });
});
