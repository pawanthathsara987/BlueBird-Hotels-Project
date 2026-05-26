import express from 'express';
import {
  getVehicleTypes,
  getVehicleType,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
} from '../controllers/manager/vehicleTypeController.js';
// import { requireAuth, requireRole } from '../middleware/authMiddleware.js'; // TODO: re-enable auth

const router = express.Router();

router.get('/', getVehicleTypes);
router.get('/:id', getVehicleType);
router.post('/', createVehicleType);
router.put('/:id', updateVehicleType);
router.delete('/:id', deleteVehicleType);

export default router;
