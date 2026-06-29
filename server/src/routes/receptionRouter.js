import express from 'express';
import { getAvailableRooms, todayCheckIns, todayCheckOuts, getOccupiedRooms, recentCheckins, recentCheckouts, recentBookings, getAnalyticsSummary, getDailyReport, getMonthlyReport } from '../controllers/reception/dashboardController.js';
import { setCheckIn, setCheckOut, getPendingCheckins, getPendingCheckOuts } from '../controllers/reception/receptionBookingController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('receptionist'));

// receptionDashboardController
router.get('/available-rooms', getAvailableRooms);
router.get('/today-checkins', todayCheckIns);
router.get('/today-checkouts', todayCheckOuts);
router.get('/occupied-rooms', getOccupiedRooms);
router.get('/recent-checkins', recentCheckins);
router.get('/recent-checkouts', recentCheckouts);
router.get('/recent-bookings', recentBookings);
router.get('/analytics-summary', getAnalyticsSummary);
router.get('/report/daily', getDailyReport);
router.get('/report/monthly', getMonthlyReport);

// receptionBookingController
router.get('/pending-checkins', getPendingCheckins);
router.post('/check-in/:reservation_id', setCheckIn);
router.get("/pending-checkouts", getPendingCheckOuts);
router.patch("/bookings/:id/checkout", setCheckOut);


export default router;  