import express from 'express';
import {
    createTourItem,
    getAllTourItems,
    getTourItem,
    updateTourItem,
    deleteTourItem
} from '../controllers/manager/tourItemController.js';
import {
    createTour,
    getAllTours,
    getTourById,
    updateTour,
    deleteTour,
    upload as tourUpload
} from '../controllers/manager/tourController.js';
import { getAirportPickupRequests } from '../controllers/manager/airportPickupController.js';
import { getDriverPrice, updateDriverPrice } from '../controllers/manager/driverPricingController.js';
import { getVehicleRentalPolicy, updateVehicleRentalPolicy } from '../controllers/manager/vehicleRentalPolicyController.js';
import {
    getDrivers,
    getDriver,
    createDriver,
    updateDriver,
    deleteDriver,
    upload as driverUpload,
} from '../controllers/manager/driverController.js';
// Manager auth temporarily disabled for testing
// Checklist routes removed
import {
    getVehicleBooking,
    updateBookingStatus,
    assignDriver,
    collectBalance,
    cancelBooking
} from '../controllers/manager/vehicleBookingManagerController.js';
import { getVehicleReportDashboard } from '../controllers/manager/vehicleReportController.js';

const router = express.Router();

console.log("✅ Manager routes loaded");

// Tour Items routes
router.post('/tour-items', createTourItem);
router.get('/tour-items', getAllTourItems);
router.get('/tour-items/:itemId', getTourItem);
router.put('/tour-items/:itemId', updateTourItem);
router.delete('/tour-items/:itemId', deleteTourItem);

// Tours routes
router.post('/tours', tourUpload.single('image'), createTour);
router.get('/tours', getAllTours);
router.get('/tours/:id', getTourById);
router.put('/tours/:id', tourUpload.single('image'), updateTour);
router.delete('/tours/:id', deleteTour);

// Airport pickup requests
router.get('/airport-pickups', getAirportPickupRequests);

// Shared driver price
router.get('/driver-price', getDriverPrice);
router.put('/driver-price', updateDriverPrice);

// Shared vehicle rental policy and charges
router.get('/vehicle-rental-policy', getVehicleRentalPolicy);
router.put('/vehicle-rental-policy', updateVehicleRentalPolicy);

// Drivers CRUD
router.get('/drivers', getDrivers);
router.get('/drivers/:id', getDriver);
router.post('/drivers', driverUpload.single('driverImage'), createDriver);
router.put('/drivers/:id', driverUpload.single('driverImage'), updateDriver);
router.delete('/drivers/:id', deleteDriver);

// Checklist routes removed
// manager specific: vehicle bookings (picker)
router.get('/vehicle-bookings/:id', getVehicleBooking);
router.put('/vehicle-bookings/:id/status', updateBookingStatus);
router.put('/vehicle-bookings/:id/assign-driver', assignDriver);
router.put('/vehicle-bookings/:id/collect-balance', collectBalance);
router.put('/vehicle-bookings/:id/cancel', cancelBooking);
router.get('/vehicle-reports', getVehicleReportDashboard);

export default router;
