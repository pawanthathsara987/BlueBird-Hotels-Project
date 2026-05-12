import express from 'express';
import {
  getVehicles,
  getVehicle,
  checkAvailability,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/manager/vehicleController.js';

import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();
const isManager = [requireAuth, requireRole('manager')];

router.get('/', getVehicles);

router.post('/', isManager, createVehicle);
router.put('/:id', isManager, updateVehicle);
router.delete('/:id', isManager, deleteVehicle);

router.get('/:id/availability', checkAvailability);
router.get('/:id', getVehicle);

export default router;