import express from 'express';
import {
  getServiceLogsForVehicle,
  createServiceLog,
  updateServiceLog,
  deleteServiceLog,
  getAllServiceLogs,
} from '../controllers/manager/vehicleServiceLogController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

// GET /api/vehicles/:vehicleId/service-logs
router.get('/', requireAuth, requireRole('manager'), getServiceLogsForVehicle);
// POST /api/vehicles/:vehicleId/service-logs
router.post('/', requireAuth, requireRole('manager'), createServiceLog);

// For individual log operations (update/delete)
// PUT /api/service-logs/:id
// DELETE /api/service-logs/:id
const standalone = express.Router();
standalone.get('/', requireAuth, requireRole('manager'), getAllServiceLogs);
standalone.put('/:id', requireAuth, requireRole('manager'), updateServiceLog);
standalone.delete('/:id', requireAuth, requireRole('manager'), deleteServiceLog);

export default { nested: router, standalone };
