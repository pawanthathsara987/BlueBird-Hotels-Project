import Vehicle from '../../models/vehicle/vehicleModel.js';
import VehicleServiceLog from '../../models/vehicle/vehicleServiceLogModel.js';

const validatePayload = (body) => {
  const errors = {};
  if (!String(body.serviceType || '').trim()) errors.serviceType = 'serviceType is required';
  if (body.cost != null && Number.isNaN(Number(body.cost))) errors.cost = 'cost must be a number';
  if (body.performedAt && Number.isNaN(new Date(body.performedAt).getTime())) errors.performedAt = 'performedAt must be a valid date';
  if (body.nextServiceDue && Number.isNaN(new Date(body.nextServiceDue).getTime())) errors.nextServiceDue = 'nextServiceDue must be a valid date';
  return errors;
};

// GET /api/vehicles/:vehicleId/service-logs
export const getServiceLogsForVehicle = async (req, res) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    const logs = await VehicleServiceLog.findAll({ where: { vehicleId }, order: [['performedAt', 'DESC']] });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/vehicles/:vehicleId/service-logs
export const createServiceLog = async (req, res) => {
  try {
    const vehicleId = Number(req.params.vehicleId);
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    const errors = validatePayload(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Validation failed', errors });

    const payload = {
      vehicleId,
      serviceType: req.body.serviceType,
      performedAt: req.body.performedAt || new Date(),
      description: req.body.description || null,
      cost: req.body.cost != null ? Number(req.body.cost) : null,
      performedBy: req.body.performedBy || null,
      nextServiceDue: req.body.nextServiceDue || null,
      receiptUrl: req.body.receiptUrl || null,
    };

    const log = await VehicleServiceLog.create(payload);
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/service-logs/:id
export const updateServiceLog = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const log = await VehicleServiceLog.findByPk(id);
    if (!log) return res.status(404).json({ success: false, message: 'Service log not found' });

    const errors = validatePayload(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Validation failed', errors });

    const updates = {
      serviceType: req.body.serviceType,
      performedAt: req.body.performedAt || log.performedAt,
      description: req.body.description || log.description,
      cost: req.body.cost != null ? Number(req.body.cost) : log.cost,
      performedBy: req.body.performedBy || log.performedBy,
      nextServiceDue: req.body.nextServiceDue || log.nextServiceDue,
      receiptUrl: req.body.receiptUrl || log.receiptUrl,
    };

    await log.update(updates);
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/service-logs/:id
export const deleteServiceLog = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const log = await VehicleServiceLog.findByPk(id);
    if (!log) return res.status(404).json({ success: false, message: 'Service log not found' });

    await log.destroy();
    res.json({ success: true, message: 'Service log deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/service-logs
export const getAllServiceLogs = async (req, res) => {
  try {
    const logs = await VehicleServiceLog.findAll({ order: [['performedAt', 'DESC']] });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  getServiceLogsForVehicle,
  createServiceLog,
  updateServiceLog,
  deleteServiceLog,
};
