import express from 'express';
import {
  createPayment,
  getPaymentById,
  getPaymentsByBookingId,
  verifyDepositPayment,
  verifyFinalPayment,
  handlePaymentFailure,
  getAllPayments,
  getPaymentStats,
} from '../controllers/booking/tourPaymentController.js';

const router = express.Router();

// Create payment record
router.post('/', createPayment);

// Get all payments
router.get('/', getAllPayments);

// Get payment stats
router.get('/stats', getPaymentStats);

// Get payment by ID
router.get('/:id', getPaymentById);

// Get payments by booking ID
router.get('/booking/:bookingId', getPaymentsByBookingId);

// Verify deposit payment (50%)
router.post('/verify/deposit', verifyDepositPayment);

// Verify final payment (remaining 50%)
router.post('/verify/final', verifyFinalPayment);

// Handle payment failure
router.post('/failure', handlePaymentFailure);

export default router;
