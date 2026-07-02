import express from 'express';
import { getAvailableRooms, todayCheckIns, todayCheckOuts, getOccupiedRooms, recentCheckins, recentCheckouts, recentBookings, getAnalyticsSummary, getDailyReport, getMonthlyReport } from '../controllers/reception/dashboardController.js';
import { setCheckIn, setCheckOut, getPendingCheckins, getPendingCheckOuts, getAirportPickups, updateAirportPickupStatus, createAirportPickup, getPickupAlerts } from '../controllers/reception/receptionBookingController.js';
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

import { getDrivers } from '../controllers/manager/driverController.js';
import { getVehicles } from '../controllers/manager/vehicleController.js';

// Airport Pickups
router.get('/airport-pickups', getAirportPickups);
router.get('/pickup-alerts', getPickupAlerts);
router.patch('/airport-pickups/:id/status', updateAirportPickupStatus);
router.post('/airport-pickups', createAirportPickup);

// Vehicles and Drivers for Airport Pickup assignment
router.get('/drivers', getDrivers);
router.get('/vehicles', getVehicles);

// Vehicle Rentals (Reception side)
import { getReceptionVehicleBookings, createReceptionVehicleBooking, cancelReceptionVehicleBooking, getDriverPricing, checkVehicleAvailability, getReceptionVehiclePolicy } from '../controllers/reception/receptionVehicleBookingController.js';
router.get('/vehicle-bookings', getReceptionVehicleBookings);
router.post('/vehicle-bookings', createReceptionVehicleBooking);
router.put('/vehicle-bookings/:id/cancel', cancelReceptionVehicleBooking);
router.get('/driver-pricing', getDriverPricing);
router.get('/vehicle-bookings/check-availability', checkVehicleAvailability);
router.get('/vehicle-policy', getReceptionVehiclePolicy);

// Tours and Tour Inquiries
import { getAllTours } from '../controllers/manager/tourController.js';
import { createTourInquiry, getAllInquiries, acceptInquiry, rejectInquiry, cancelInquiry, updatePax } from '../controllers/reception/receptionTourController.js';

router.get('/tours', getAllTours);
router.get('/tour-inquiries', getAllInquiries);
router.post('/tour-inquiries', createTourInquiry);
router.put('/tour-inquiries/:id/accept', acceptInquiry);
router.put('/tour-inquiries/:id/reject', rejectInquiry);
router.put('/tour-inquiries/:id/cancel', cancelInquiry);
router.put('/tour-inquiries/:id/pax', updatePax);


export default router;  