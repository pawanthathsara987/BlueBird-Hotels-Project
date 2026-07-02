import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
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

// ── PUBLIC read-only endpoints (no token required) ────────────────────────────
// Used by: TourViewing (customer booking page), TourDetailsPage
router.get('/tours',            getAllTours);
router.get('/tours/:id',        getTourById);
router.get('/tour-items',       getAllTourItems);
router.get('/tour-items/:itemId', getTourItem);

// ── All routes below require a valid manager JWT ──────────────────────────────
router.use(requireAuth);
router.use(requireRole('manager'));
// ─────────────────────────────────────────────────────────────────────────────

// Tour Items routes (write operations — manager only)
router.post('/tour-items', createTourItem);
router.put('/tour-items/:itemId', updateTourItem);
router.delete('/tour-items/:itemId', deleteTourItem);

// Tours routes (write operations — manager only)
router.post('/tours', tourUpload.single('image'), createTour);
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

import { upload } from '../middleware/uploadMiddleware.js';

// Vehicle bookings (manager)
router.get('/vehicle-bookings', getVehicleBookings);
router.get('/vehicle-bookings/:id', getVehicleBooking);
router.put('/vehicle-bookings/:id/status', updateBookingStatus);
router.put('/vehicle-bookings/:id/assign-driver', assignDriver);
router.put('/vehicle-bookings/:id/collect-balance', upload.single('receiptImage'), collectBalance);
router.put('/vehicle-bookings/:id/cancel', cancelBooking);
router.get('/vehicle-bookings/:id/bill-preview', previewBill);
router.post('/vehicle-bookings/:id/generate-bill', generateBill);
router.put('/vehicle-bookings/:id/collect-final-settlement', upload.single('receiptImage'), collectFinalSettlement);
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
