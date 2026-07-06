import express from 'express';
import { generatePayHereHash, handlePayHereNotification, confirmTourPayment, confirmVehiclePayment, tourPayWallet } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Secure backend hash generator protected by client JWT authentication middleware
router.post('/payhere-hash', requireAuth, generatePayHereHash);

// Public webhook endpoint for PayHere server-to-server callback notifications
router.post('/notify', handlePayHereNotification);

// Client-side fallback to confirm and log tour payments immediately
router.post('/tour-confirm', requireAuth, confirmTourPayment);

// Client-side fallback to confirm and log vehicle payments immediately
router.post('/vehicle-confirm', requireAuth, confirmVehiclePayment);

// Pay for tour booking fully from wallet
router.post('/tour-pay-wallet', requireAuth, tourPayWallet);

export default router;
