import express from 'express';
import {
  getVehicleTypes,
  getVehicleType,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
} from '../controllers/manager/vehicleTypeController.js';

const router = express.Router();

router.get('/', getVehicleTypes);
router.post('/', createVehicleType);
router.get('/:id', getVehicleType);
router.put('/:id', updateVehicleType);
router.delete('/:id', deleteVehicleType);

export default router;
