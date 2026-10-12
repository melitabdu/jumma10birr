// src/routes/donationRoutes.js
import express from 'express';
import { initiateDonation, handleNotification } from '../controllers/donationController.js';

const router = express.Router();

// POST /api/donations/initiate-donation -> Called by your React Native app
router.post('/initiate-donation', initiateDonation);

// POST /api/donations/notify -> Called by Telebirr background servers
router.post('/notify', handleNotification);

export default router;