import express from 'express';
import {
  getVehicles,
  getVehicle,
  checkAvailability,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  upload,
} from '../controllers/manager/vehicleController.js';
import { createVehicleBooking } from '../controllers/booking/vehicleBookingController.js';

// import { requireAuth, requireRole } from '../middleware/authMiddleware.js'; // TODO: re-enable auth

const router = express.Router();

router.get('/', getVehicles);

// Manager-only vehicle write operations (auth temporarily disabled)
router.post('/', upload.single('image'), createVehicle);
router.put('/:id', upload.single('image'), updateVehicle);
router.delete('/:id', deleteVehicle);

router.get('/:id/availability', checkAvailability);
router.get('/:id', getVehicle);
router.post('/:id/book', createVehicleBooking);

export default router;