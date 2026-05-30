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
    getVehicleBookings,
    getVehicleBooking,
    updateBookingStatus,
    assignDriver,
    collectBalance,
    cancelBooking,
    previewBill,
    generateBill,
    collectFinalSettlement
} from '../controllers/manager/vehicleBookingManagerController.js';
import { getVehicleReportDashboard } from '../controllers/manager/vehicleReportController.js';
import {
    getServiceLogs,
    getServiceLog,
    createServiceLog,
    updateServiceLog,
    deleteServiceLog,
    upload as serviceLogUpload,
} from '../controllers/manager/serviceLogController.js';
import {
    getChecklists,
    getChecklist,
    createChecklist,
    updateChecklist,
    deleteChecklist
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

// Vehicle bookings (manager)
router.get('/vehicle-bookings', getVehicleBookings);
router.get('/vehicle-bookings/:id', getVehicleBooking);
router.put('/vehicle-bookings/:id/status', updateBookingStatus);
router.put('/vehicle-bookings/:id/assign-driver', assignDriver);
router.put('/vehicle-bookings/:id/collect-balance', collectBalance);
router.put('/vehicle-bookings/:id/cancel', cancelBooking);
router.get('/vehicle-bookings/:id/bill-preview', previewBill);
router.post('/vehicle-bookings/:id/generate-bill', generateBill);
router.put('/vehicle-bookings/:id/collect-final-settlement', collectFinalSettlement);
router.get('/vehicle-reports', getVehicleReportDashboard);

// Vehicle service logs CRUD
router.get('/service-logs', getServiceLogs);
router.get('/service-logs/:id', getServiceLog);
router.post('/service-logs', serviceLogUpload.single('receiptImage'), createServiceLog);
router.put('/service-logs/:id', serviceLogUpload.single('receiptImage'), updateServiceLog);
router.delete('/service-logs/:id', deleteServiceLog);

// Vehicle checklists CRUD
router.get('/checklists', getChecklists);
router.get('/checklists/:id', getChecklist);
router.post('/checklists', createChecklist);
router.put('/checklists/:id', updateChecklist);
router.delete('/checklists/:id', deleteChecklist);

export default router;
