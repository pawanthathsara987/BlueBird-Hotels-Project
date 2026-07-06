import { Op } from 'sequelize';
import multer from 'multer';
import Driver from '../../models/vehicle/driverModel.js';
import VehicleBooking from '../../models/vehicle/VehicleBookingModel.js';
import Vehicle from '../../models/vehicle/vehicleModel.js';
import Customer from '../../models/User/Customer.js';
import { supabaseTour as supabase } from '../../config/supabaseClient.js';

// Multer memory storage for image uploads
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const DRIVER_BUCKET = 'Blue-Bird';

const uploadImageToSupabase = async (file) => {
  if (!file) return null;
  const fileName = `drivers/${Date.now()}-${file.originalname}`;

  const { error } = await supabase.storage.from(DRIVER_BUCKET).upload(
    fileName,
    file.buffer,
    { contentType: file.mimetype, upsert: false }
  );

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabase.storage.from(DRIVER_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
};

const deleteImageFromSupabase = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes(`/${DRIVER_BUCKET}/`)) return;
  const oldPath = imageUrl.split(`/${DRIVER_BUCKET}/`)[1];
  if (!oldPath) return;
  await supabase.storage.from(DRIVER_BUCKET).remove([oldPath]);
};

// ── Validation helpers ───────────────────────────────────────────────────────

// Sri Lankan phone: +94XXXXXXXXX, 0XXXXXXXXX, or just digits (9-10 digits)
const PHONE_REGEX = /^(\+94|0)?[0-9]{9,10}$/;

// Sri Lankan NIC: old format 9-digit + V/X, new format 12 digits
const NIC_REGEX = /^([0-9]{9}[vVxX]|[0-9]{12})$/;

const validateDriver = (body) => {
  const errors = {};

  if (!String(body.fullName || '').trim()) errors.fullName = 'Full name is required.';

  // NIC validation
  const nic = String(body.nicNo || '').trim();
  if (!nic) {
    errors.nicNo = 'NIC number is required.';
  } else if (!NIC_REGEX.test(nic)) {
    errors.nicNo = 'Invalid NIC format. Use old format (e.g. 200012345V) or new format (e.g. 200012345678).';
  }

  // Phone validation
  const phone = String(body.phone || '').trim();
  if (!phone) {
    errors.phone = 'Phone is required.';
  } else if (!PHONE_REGEX.test(phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Invalid phone format. Use Sri Lankan format (e.g. 0771234567 or +94771234567).';
  }

  if (!String(body.licenseNo || '').trim()) errors.licenseNo = 'License number is required.';

  // License expiry: reject already-expired licenses
  const expiryStr = String(body.licenseExpiry || '').trim();
  if (!expiryStr) {
    errors.licenseExpiry = 'License expiry is required.';
  } else {
    const expiryDate = new Date(expiryStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(expiryDate.getTime())) {
      errors.licenseExpiry = 'Invalid license expiry date.';
    } else if (expiryDate < today) {
      errors.licenseExpiry = 'License has already expired. Please renew before adding/updating the driver.';
    }
  }

  return errors;
};

// Returns non-blocking warnings (e.g. license expiring within 30 days)
const getLicenseWarnings = (body) => {
  const warnings = {};
  const expiryStr = String(body.licenseExpiry || '').trim();
  if (expiryStr) {
    const expiryDate = new Date(expiryStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    if (!isNaN(expiryDate.getTime()) && expiryDate >= today && expiryDate <= thirtyDaysFromNow) {
      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      warnings.licenseExpiry = `License expires in ${daysLeft} day(s). Consider renewing soon.`;
    }
  }
  return warnings;
};

// ── GET all drivers (with pagination & search) ───────────────────────────────
export const getDrivers = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const where = {};

    if (status) where.status = status;

    // Search by name, NIC, phone, or license number
    if (search) {
      const term = `%${search.trim()}%`;
      where[Op.or] = [
        { fullName: { [Op.like]: term } },
        { nicNo: { [Op.like]: term } },
        { phone: { [Op.like]: term } },
        { licenseNo: { [Op.like]: term } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * pageSize;

    const { count, rows: drivers } = await Driver.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
    });

    res.json({
      success: true,
      count: drivers.length,
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / pageSize),
      data: drivers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET single driver ────────────────────────────────────────────────────────
export const getDriver = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id, {
      include: [
        {
          model: VehicleBooking,
          as: 'bookings',
          include: [
            { model: Vehicle, as: 'vehicle', attributes: ['brand', 'model', 'plateNumber', 'image', 'vehicleTypeId'] },
            { model: Customer, as: 'customer', attributes: ['firstName', 'lastName', 'email', 'phoneNumber'] }
          ],
          required: false // driver might not have bookings
        }
      ],
      order: [
        [{ model: VehicleBooking, as: 'bookings' }, 'pickupDatetime', 'ASC']
      ]
    });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, data: driver });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── CREATE driver ────────────────────────────────────────────────────────────
export const createDriver = async (req, res) => {
  try {
    const validation = validateDriver(req.body);
    if (Object.keys(validation).length) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation });
    }

    let image = null;
    if (req.file) {
      try {
        image = await uploadImageToSupabase(req.file);
      } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
    }

    const payload = {
      fullName: String(req.body.fullName).trim(),
      nicNo: String(req.body.nicNo).trim(),
      dateOfBirth: req.body.dateOfBirth || null,
      phone: String(req.body.phone).trim(),
      address: req.body.address || null,
      licenseNo: String(req.body.licenseNo).trim(),
      licenseClass: req.body.licenseClass || null,
      licenseExpiry: req.body.licenseExpiry,
      employmentType: req.body.employmentType || 'full_time',
      status: req.body.status || 'active',
      languageSkills: (() => { try { return JSON.parse(req.body.languageSkills || '[]'); } catch { return []; } })(),
      driverImage: image,
      notes: req.body.notes || null,
    };

    const driver = await Driver.create(payload);

    // Include license expiry warning in response if applicable
    const warnings = getLicenseWarnings(req.body);

    res.status(201).json({ success: true, data: driver, warnings });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'NIC or License already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE driver ────────────────────────────────────────────────────────────
export const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    const validation = validateDriver(req.body);
    if (Object.keys(validation).length) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation });
    }

    let image = driver.driverImage;
    if (req.file) {
      try {
        await deleteImageFromSupabase(driver.driverImage);
      } catch (err) {
        console.error('Error deleting old driver image:', err.message);
      }
      try {
        image = await uploadImageToSupabase(req.file);
      } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
    }

    // FIX: Use explicit undefined checks instead of || so fields CAN be cleared to empty
    const updates = {
      fullName: String(req.body.fullName).trim(),
      nicNo: String(req.body.nicNo).trim(),
      dateOfBirth: req.body.dateOfBirth || null,
      phone: String(req.body.phone).trim(),
      address: req.body.address !== undefined ? (req.body.address || null) : driver.address,
      licenseNo: String(req.body.licenseNo).trim(),
      licenseClass: req.body.licenseClass !== undefined ? (req.body.licenseClass || null) : driver.licenseClass,
      licenseExpiry: req.body.licenseExpiry,
      employmentType: req.body.employmentType ?? driver.employmentType,
      status: req.body.status ?? driver.status,
      languageSkills: (() => { try { return JSON.parse(req.body.languageSkills || 'null') ?? driver.languageSkills; } catch { return driver.languageSkills; } })(),
      driverImage: image,
      notes: req.body.notes !== undefined ? (req.body.notes || null) : driver.notes,
    };

    await driver.update(updates);

    // Include license expiry warning in response if applicable
    const warnings = getLicenseWarnings(req.body);

    res.json({ success: true, data: driver, warnings });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'NIC or License already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE driver (soft-delete via paranoid) ─────────────────────────────────
export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    // Only block delete if driver has active (non-terminal) bookings
    const assignedBooking = await VehicleBooking.findOne({
      where: {
        driverId: driver.id,
        status: { [Op.in]: ['confirmed', 'driver_assigned', 'balance_paid', 'ongoing', 'returned'] },
      },
      attributes: ['id', 'bookingNo', 'status'],
    });

    if (assignedBooking) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete driver with assigned booking ${assignedBooking.bookingNo || assignedBooking.id}`,
      });
    }

    // With paranoid: true on the model, this sets deletedAt instead of removing the row
    await driver.destroy();
    res.json({ success: true, message: 'Driver deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  upload,
};
