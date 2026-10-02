import asyncHandler from "express-async-handler";
import axios from "axios";
import Donation from "../models/donationModel.js";
import User from "../models/userModel.js";

/** Helper: next Friday for recurring donations */
const getNextFriday = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = (5 + 7 - day) % 7 || 7;
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + diff);
  nextFriday.setHours(12, 0, 0, 0);
  return nextFriday;
};

/** Manual Donation */
export const createDonation = asyncHandler(async (req, res) => {
  const { amount, mosqueCode, donationType } = req.body;

  if (!amount || !donationType)
    return res.status(400).json({ message: "Amount and donation type required" });

  const donation = await Donation.create({
    donor: req.user._id,
    amount,
    mosqueCode: mosqueCode || "GENERAL",
    donationType,
    paymentMethod: "manual",
    status: "completed",
    confirmed: true,
  });

  res.status(201).json({ message: "Donation recorded successfully", donation });
});

/** Chapa Donation */
export const createChapaDonation = asyncHandler(async (req, res) => {
  const { amount, donationType, mosqueCode, recurring, email } = req.body;

  if (!amount || !donationType)
    return res.status(400).json({ message: "Amount and donation type required" });

  const user = await User.findById(req.user._id).lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  // Safe fallback email
  const donorEmail =
    email && /^\S+@\S+\.\S+$/.test(email)
      ? email
      : `donor${Date.now()}@example.com`;

  const txRef = `CHAPA-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const payload = {
    amount,
    currency: "ETB",
    email: donorEmail,
    first_name: user.fullName || "Donor",
    tx_ref: txRef,
    callback_url: `${process.env.SERVER_URL}/api/donations/chapa/verify/${txRef}`,
    return_url: `${process.env.CLIENT_URL}/donate/success`,
    custom_fields: [
      { display_name: "Mosque Code", variable_name: "mosqueCode", value: mosqueCode || "GENERAL" },
    ],
  };

  try {
    const chapaRes = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      payload,
      { headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`, "Content-Type": "application/json" } }
    );

    const checkout = chapaRes?.data?.data?.checkout_url;
    if (!checkout) return res.status(500).json({ message: "Invalid Chapa response" });

    // Save pending donation
    const donation = await Donation.create({
      donor: user._id,
      amount,
      mosqueCode: mosqueCode || "GENERAL",
      donationType,
      status: "pending",
      txRef,
      paymentMethod: "chapa", // ✅ must be lowercase
      email: donorEmail,
      recurring: recurring
        ? { ...recurring, nextDonationDate: recurring.nextDonationDate || getNextFriday() }
        : { isRecurring: true, frequency: "weekly", nextDonationDate: getNextFriday() },
    });

    res.json({
      message: "Chapa payment initiated",
      paymentUrl: checkout,
      txRef,
      donationId: donation._id,
    });
  } catch (error) {
    console.error("❌ Chapa Donation Error:", error.response?.data || error.message);
    res.status(500).json({ message: error.response?.data?.message || "Chapa payment initiation failed" });
  }
});

/** Verify Chapa Payment */
export const verifyChapaPayment = asyncHandler(async (req, res) => {
  const { txRef } = req.params;

  try {
    const verifyRes = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${txRef}`,
      { headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` } }
    );

    const status = verifyRes.data?.data?.status;

    const donation = await Donation.findOne({ txRef });
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    donation.status = status;
    donation.confirmed = status === "success" || status === "completed";
    await donation.save();

    res.json({ message: `Payment ${status}`, status });
  } catch (error) {
    console.error("❌ Chapa Verify Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

/** Chapa Webhook */
export const chapaWebhook = asyncHandler(async (req, res) => {
  const { tx_ref, status } = req.body;

  const donation = await Donation.findOne({ txRef: tx_ref });
  if (!donation) return res.status(404).json();

  donation.status = status;
  donation.confirmed = status === "success" || status === "completed";
  await donation.save();

  res.json({ received: true });
});

/** Telebirr Webhook */
export const telebirrWebhook = asyncHandler(async (req, res) => {
  console.log("Telebirr Webhook Received:", req.body);
  res.json({ received: true });
});

/** Admin: List Donations */
export const listDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find().populate("donor", "fullName phone");
  res.json(donations);
});

/** Donations by User */
export const donationsByUser = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ donor: req.params.userId });
  res.json(donations);
});

/** Admin: Update Donation */
export const updateDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) return res.status(404).json({ message: "Donation not found" });

  Object.assign(donation, req.body);
  await donation.save();

  res.json({ message: "Donation updated", donation });
});

/** Admin: Delete Donation */
export const deleteDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (!donation) return res.status(404).json({ message: "Donation not found" });

  await donation.deleteOne();
  res.json({ message: "Donation removed" });
});
