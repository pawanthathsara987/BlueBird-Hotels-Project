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
   checkBookingPrice
} from '../controllers/booking/roomBookingController.js';

import { createVisitorBooking } from '../controllers/reception/visitingBookingController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/booking', requireAuth, createBooking);
router.post('/visitor-booking', createVisitorBooking);
router.get('/bookings', getAllBookings);
router.get('/booking/:id', getBookingById);
router.delete('/booking/:id', deleteBookingById);
router.put('/booking/:id', updateBooking);
router.get('/availableRooms', availableRooms);
router.get('/available-packages', getAvailableRoomTypesByDate);
router.post('/available-rooms', getAvailableRoomAssignForPackage);
router.get('/pricing-matrix', getPricingMatrix);
router.post('/check-price', checkBookingPrice);

export default router;