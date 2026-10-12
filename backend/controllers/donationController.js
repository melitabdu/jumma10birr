// src/controllers/donationController.js
import axios from 'axios';
import crypto from 'crypto';
import https from 'https';
import { telebirrConfig } from '../config/telebirrConfig.js';
import {Donation} from '../models/donationModel.js';

const insecureAgent = new https.Agent({  
  rejectUnauthorized: false
});

export const initiateDonation = async (req, res) => {
  try {
    const { amount, donorName } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Donation amount is required' });
    }

    const outTradeNo = 'DONATION_' + Date.now();
    const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

    const payload = {
      appId: telebirrConfig.fabricAppId,
      shortCode: telebirrConfig.merchantCode,
      outTradeNo: outTradeNo,
      subject: "App Donation",
      totalAmount: amount.toString(),
      receiveName: donorName || "Donation Campaign",
      notifyUrl: telebirrConfig.notifyUrl,
      returnUrl: "myapp://donation-success",
      timestamp: timestamp,
      nonce: crypto.randomBytes(16).toString('hex'),
      timeoutExpress: "30"
    };

    // Save pending donation in MongoDB
    await Donation.create({
      outTradeNo,
      amount: Number(amount),
      donorName: donorName || 'Anonymous',
      status: 'PENDING'
    });

    // Request Pre-Order / Checkout link from Telebirr
    const response = await axios.post(`${telebirrConfig.baseUrl}/preOrder`, {
      appid: telebirrConfig.merchantAppId,
      ussd: payload 
    }, {
      httpsAgent: insecureAgent
    });

    const paymentUrl = response.data?.data?.toPayUrl;

    if (!paymentUrl) {
      return res.status(400).json({ success: false, message: 'Failed to retrieve payment URL from Telebirr' });
    }

    return res.status(200).json({
      success: true,
      outTradeNo,
      paymentUrl
    });

  } catch (error) {
    console.error("Telebirr Init Error:", error.response?.data || error.message);
    return res.status(500).json({ 
      success: false, 
      error: error.response?.data || error.message || 'Failed to initialize payment' 
    });
  }
};

export const handleNotification = async (req, res) => {
  try {
    const notificationData = req.body;
    console.log("Received Telebirr Webhook Notification:", notificationData);

    const outTradeNo = notificationData?.outTradeNo || notificationData?.tradeNo;

    if (outTradeNo) {
      await Donation.findOneAndUpdate(
        { outTradeNo },
        { status: 'PAID', paidAt: new Date() }
      );
      console.log(`Donation ${outTradeNo} successfully updated to PAID in MongoDB.`);
    }

    return res.status(200).json({ success: true, message: 'Notification processed successfully' });
  } catch (error) {
    console.error("Webhook Processing Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};