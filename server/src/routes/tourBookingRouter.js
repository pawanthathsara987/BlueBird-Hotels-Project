import express from 'express';
import {
  getAllBookings,
  getBookingById,
  getBookingByRef,
  cancelBooking,
  getBookingStats,
  getBookingsByStatus,
  getBookingsByDateRange,
} from '../controllers/booking/tourBookingController.js';

const router = express.Router();

// Get all bookings
router.get('/', getAllBookings);

// Get booking stats
router.get('/stats', getBookingStats);

// Get bookings by status
router.get('/status/:status', getBookingsByStatus);

// Get bookings by date range
router.get('/date-range', getBookingsByDateRange);

// Get booking by reference
router.get('/ref/:bookingRef', getBookingByRef);

// Get booking by ID
router.get('/:id', getBookingById);

// Cancel booking
router.put('/:id/cancel', cancelBooking);

export default router;
