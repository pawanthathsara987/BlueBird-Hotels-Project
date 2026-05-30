import { Op } from 'sequelize';
import multer from 'multer';
import supabase from '../../config/supabaseClient.js';
import VehicleServiceLog from '../../models/vehicle/vehicleServiceLogModel.js';
import Vehicle from '../../models/vehicle/vehicleModel.js';

// ── Helpers ────────────────────────────────────────────────────────────────────

const SERVICE_TYPES = [
  'oil_change', 'tire', 'brake', 'engine', 'body_repair',
  'general_service', 'insurance_renewal', 'license_renewal', 'wash_detail', 'other',
];

// Configure multer
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs for receipts
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  },
});

const SERVICE_LOG_BUCKET = 'Blue-Bird';

const uploadReceiptToSupabase = async (file) => {
  if (!file) return null;
  const fileName = `receipts/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  const { error } = await supabase.storage.from(SERVICE_LOG_BUCKET).upload(
    fileName,
    file.buffer,
    { contentType: file.mimetype, upsert: false }
  );

  if (error) {
    throw new Error(`Receipt upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(SERVICE_LOG_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
};

const deleteReceiptFromSupabase = async (receiptUrl) => {
  if (!receiptUrl || !receiptUrl.includes(`/${SERVICE_LOG_BUCKET}/`)) return;

  const oldPath = receiptUrl.split(`/${SERVICE_LOG_BUCKET}/`)[1];
  if (!oldPath) return;

  await supabase.storage.from(SERVICE_LOG_BUCKET).remove([oldPath]);
};

const buildValidationErrors = (body) => {
  const errors = {};

  if (!body.vehicleId) errors.vehicleId = 'Vehicle is required.';
  if (!body.serviceType) {
    errors.serviceType = 'Service type is required.';
  } else if (!SERVICE_TYPES.includes(body.serviceType)) {
    errors.serviceType = 'Invalid service type.';
  }
  if (!String(body.description || '').trim()) errors.description = 'Description is required.';
  if (!body.servicedAt) errors.servicedAt = 'Service date is required.';

  if (body.cost !== undefined && body.cost !== null && body.cost !== '') {
    if (Number.isNaN(Number(body.cost)) || Number(body.cost) < 0) {
      errors.cost = 'Cost must be a positive number.';
    }
  }

  if (body.mileageAtService !== undefined && body.mileageAtService !== null && body.mileageAtService !== '') {
    if (Number.isNaN(Number(body.mileageAtService)) || Number(body.mileageAtService) < 0) {
      errors.mileageAtService = 'Mileage must be a positive number.';
    }
  }

  return errors;
};

// ── GET /api/manager/service-logs ──────────────────────────────────────────────
// List all service logs with optional filters
export const getServiceLogs = async (req, res) => {
  try {
    const { vehicleId, serviceType, from, to, limit = 100, offset = 0 } = req.query;

    const where = {};
    if (vehicleId) where.vehicleId = Number(vehicleId);
    if (serviceType) where.serviceType = serviceType;
    if (from || to) {
      where.servicedAt = {};
      if (from) where.servicedAt[Op.gte] = from;
      if (to) where.servicedAt[Op.lte] = to;
    }

    const { count, rows } = await VehicleServiceLog.findAndCountAll({
      where,
      include: [{ model: Vehicle, as: 'vehicle', attributes: ['id', 'plateNumber', 'brand', 'model'] }],
      order: [['servicedAt', 'DESC']],
      limit: Math.min(Number(limit), 500),
      offset: Number(offset),
    });

    res.json({ success: true, count, data: rows });
  } catch (err) {
    console.error('getServiceLogs error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/manager/service-logs/:id ──────────────────────────────────────────
export const getServiceLog = async (req, res) => {
  try {
    const log = await VehicleServiceLog.findByPk(req.params.id, {
      include: [{ model: Vehicle, as: 'vehicle', attributes: ['id', 'plateNumber', 'brand', 'model'] }],
    });

    if (!log) {
      return res.status(404).json({ success: false, message: 'Service log not found' });
    }

    res.json({ success: true, data: log });
  } catch (err) {
    console.error('getServiceLog error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/manager/service-logs ─────────────────────────────────────────────
export const createServiceLog = async (req, res) => {
  try {
    const errors = buildValidationErrors(req.body);
    
    if (req.file) {
      if (req.file.size > 5 * 1024 * 1024) {
        errors.receiptImage = 'Receipt file must be 5MB or smaller.';
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    // Check vehicle exists
    const vehicle = await Vehicle.findByPk(req.body.vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Upload receipt if provided
    let receiptUrl = null;
    if (req.file) {
      try {
        receiptUrl = await uploadReceiptToSupabase(req.file);
      } catch (uploadErr) {
        return res.status(400).json({ success: false, message: uploadErr.message });
      }
    }

    const log = await VehicleServiceLog.create({
      vehicleId: req.body.vehicleId,
      serviceType: req.body.serviceType,
      description: req.body.description,
      servicedAt: req.body.servicedAt,
      mileageAtService: req.body.mileageAtService || null,
      cost: req.body.cost || 0,
      vendor: req.body.vendor || null,
      performedBy: req.body.performedBy || null,
      nextServiceDue: req.body.nextServiceDue || null,
      nextServiceMileage: req.body.nextServiceMileage || null,
      notes: req.body.notes || null,
      receiptUrl,
    });

    res.status(201).json({ success: true, data: log });
  } catch (err) {
    console.error('createServiceLog error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/manager/service-logs/:id ──────────────────────────────────────────
export const updateServiceLog = async (req, res) => {
  try {
    const log = await VehicleServiceLog.findByPk(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Service log not found' });
    }

    const errors = buildValidationErrors({ ...log.toJSON(), ...req.body });
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    let receiptUrl = log.receiptUrl;
    if (req.file) {
      try {
        await deleteReceiptFromSupabase(log.receiptUrl);
      } catch (err) {
        console.error('Error deleting old receipt:', err);
      }
      try {
        receiptUrl = await uploadReceiptToSupabase(req.file);
      } catch (uploadErr) {
        return res.status(400).json({ success: false, message: uploadErr.message });
      }
    }

    await log.update({
      serviceType: req.body.serviceType ?? log.serviceType,
      description: req.body.description ?? log.description,
      servicedAt: req.body.servicedAt ?? log.servicedAt,
      mileageAtService: req.body.mileageAtService ?? log.mileageAtService,
      cost: req.body.cost ?? log.cost,
      vendor: req.body.vendor ?? log.vendor,
      performedBy: req.body.performedBy ?? log.performedBy,
      nextServiceDue: req.body.nextServiceDue ?? log.nextServiceDue,
      nextServiceMileage: req.body.nextServiceMileage ?? log.nextServiceMileage,
      notes: req.body.notes ?? log.notes,
      receiptUrl,
    });

    res.json({ success: true, data: log });
  } catch (err) {
    console.error('updateServiceLog error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/manager/service-logs/:id ────────────────────────────────────────
export const deleteServiceLog = async (req, res) => {
  try {
    const log = await VehicleServiceLog.findByPk(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Service log not found' });
    }

    try {
      await deleteReceiptFromSupabase(log.receiptUrl);
    } catch (err) {
      console.error('Error deleting receipt from Supabase:', err);
    }

    await log.destroy();
    res.json({ success: true, message: 'Service log deleted' });
  } catch (err) {
    console.error('deleteServiceLog error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export default { getServiceLogs, getServiceLog, createServiceLog, updateServiceLog, deleteServiceLog };
