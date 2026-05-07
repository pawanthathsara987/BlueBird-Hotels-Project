import express from 'express';
import { getAvailableRooms, todayCheckIns, todayCheckOuts, getOccupiedRooms, recentCheckins, recentCheckouts, recentBookings } from '../controllers/reception/dashboardController.js';
import { setCheckIn, setCheckOut } from '../controllers/reception/receptionBookingController.js';

const router = express.Router();

// receptionDashboardController
router.get('/available-rooms', getAvailableRooms);
router.get('/today-checkins', todayCheckIns);
router.get('/today-checkouts', todayCheckOuts);
router.get('/occupied-rooms', getOccupiedRooms);
router.get('/recent-checkins', recentCheckins);
router.get('/recent-checkouts', recentCheckouts);
router.get('/recent-bookings', recentBookings);

// receptionBookingController
router.patch('/bookings/:id/checkin', setCheckIn);
router.patch('/bookings/:id/checkout', setCheckOut);

export default router;