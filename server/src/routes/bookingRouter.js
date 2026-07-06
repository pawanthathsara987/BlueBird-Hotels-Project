import express from 'express';
import {
   createBooking,
   getAllBookings,
   getBookingById,
   deleteBookingById,
   updateBooking,
   availableRooms,
   getAvailableRoomTypesByDate,
   getAvailableRoomAssignForPackage,
   getPricingMatrix,
   checkBookingPrice,
   getActivePolicy,
   getAirportPickupVehicles
} from '../controllers/booking/roomBookingController.js';

import { createVisitorBooking, createReceptionCustomer } from '../controllers/reception/visitingBookingController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
   getRefundEligibility,
   calculateRefund,
   createRefundRequest,
   getPendingRefunds,
   actionRefundRequest,
   getBookingRefundHistory,
   getRefundReports,
   getAllPendingRefunds,
   actionCategoryRefundRequest
} from '../controllers/booking/refundController.js';

const router = express.Router();

router.post('/booking', requireAuth, createBooking);
router.post('/visitor-booking', createVisitorBooking);
router.post('/reception-customer', createReceptionCustomer);
router.get('/bookings', getAllBookings);
router.get('/booking/:id', getBookingById);
router.delete('/booking/:id', deleteBookingById);
router.put('/booking/:id', updateBooking);
router.get('/availableRooms', availableRooms);
router.get('/available-packages', getAvailableRoomTypesByDate);
router.post('/available-rooms', getAvailableRoomAssignForPackage);
router.get('/pricing-matrix', getPricingMatrix);
router.post('/check-price', checkBookingPrice);
router.get('/policy', getActivePolicy);
router.get('/airport-vehicles', getAirportPickupVehicles);

// Refund routes
router.get('/refunds/eligibility/:bookingId', requireAuth, getRefundEligibility);
router.post('/refunds/calculate', requireAuth, calculateRefund);
router.post('/refunds', requireAuth, createRefundRequest);
router.get('/refunds/pending', requireAuth, getPendingRefunds);
router.get('/refunds/all-pending', requireAuth, getAllPendingRefunds);
router.post('/refunds/:refundId/action', requireAuth, actionRefundRequest);
router.post('/refunds/:category/:refundId/action', requireAuth, actionCategoryRefundRequest);
router.get('/refunds/history/:bookingId', requireAuth, getBookingRefundHistory);
router.get('/refunds/reports', requireAuth, getRefundReports);

export default router;