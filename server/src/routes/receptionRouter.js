import express from 'express';
import { getAvailableRooms, todayCheckIns, todayCheckOuts, getOccupiedRooms, recentCheckins, recentCheckouts, recentBookings } from '../controllers/reception/dashboardController.js';
import { setCheckIn, setCheckOut, getPendingCheckins, getPendingCheckOuts } from '../controllers/reception/receptionBookingController.js';

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
router.get('/pending-checkins', getPendingCheckins);
router.post('/check-in/:reservation_id', setCheckIn);
router.get("/pending-checkouts", getPendingCheckOuts);
router.patch("/bookings/:id/checkout", setCheckOut);


export default router;  