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
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import {
    createChecklist,
    getChecklist,
    getChecklistsByBooking,
    updateChecklist,
    deleteChecklist,
} from '../controllers/manager/checklistController.js';

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
router.get('/driver-price', requireAuth, requireRole('manager'), getDriverPrice);
router.put('/driver-price', requireAuth, requireRole('manager'), updateDriverPrice);

// Shared vehicle rental policy and charges
router.get('/vehicle-rental-policy', getVehicleRentalPolicy);
router.put('/vehicle-rental-policy', updateVehicleRentalPolicy);

// Drivers CRUD
router.get('/drivers', getDrivers);
router.get('/drivers/:id', getDriver);
router.post('/drivers', driverUpload.single('driverImage'), createDriver);
router.put('/drivers/:id', driverUpload.single('driverImage'), updateDriver);
router.delete('/drivers/:id', deleteDriver);

// Checklist routes (pickup / return inspections)
router.post('/checklists', createChecklist);
router.get('/checklists/:id', getChecklist);
router.get('/bookings/:bookingId/checklists', getChecklistsByBooking);
router.put('/checklists/:id', updateChecklist);
router.delete('/checklists/:id', deleteChecklist);

export default router;
