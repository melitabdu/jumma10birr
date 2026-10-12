// src/models/donationModel.js
import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  outTradeNo: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  donorName: { type: String, default: 'Anonymous' },
  status: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
  paidAt: { type: Date }
}, { timestamps: true });

export const Donation = mongoose.model('Donation', donationSchema);