import express from 'express';
import {
  getVehicleTypes,
  getVehicleType,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
} from '../controllers/manager/vehicleTypeController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getVehicleTypes);
router.get('/:id', getVehicleType);
router.post('/', requireAuth, requireRole('manager'), createVehicleType);
router.put('/:id', requireAuth, requireRole('manager'), updateVehicleType);
router.delete('/:id', requireAuth, requireRole('manager'), deleteVehicleType);

export default router;
