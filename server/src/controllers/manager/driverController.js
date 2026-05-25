import multer from 'multer';
import Driver from '../../models/vehicle/driverModel.js';
import VehicleBooking from '../../models/vehicle/VehicleBookingModel.js';
import supabase from '../../config/supabaseClient.js';

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

// Basic validation
const validateDriver = (body) => {
  const errors = {};
  if (!String(body.fullName || '').trim()) errors.fullName = 'Full name is required.';
  if (!String(body.nicNo || '').trim()) errors.nicNo = 'NIC number is required.';
  if (!String(body.phone || '').trim()) errors.phone = 'Phone is required.';
  if (!String(body.licenseNo || '').trim()) errors.licenseNo = 'License number is required.';
  if (!String(body.licenseExpiry || '').trim()) errors.licenseExpiry = 'License expiry is required.';
  return errors;
};

export const getDrivers = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const drivers = await Driver.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json({ success: true, count: drivers.length, data: drivers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDriver = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, data: driver });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

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
      languageSkills: req.body.languageSkills || [],
      driverImage: image,
      notes: req.body.notes || null,
    };

    const driver = await Driver.create(payload);
    res.status(201).json({ success: true, data: driver });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'NIC or License already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

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

    const updates = {
      fullName: String(req.body.fullName).trim(),
      nicNo: String(req.body.nicNo).trim(),
      dateOfBirth: req.body.dateOfBirth || null,
      phone: String(req.body.phone).trim(),
      address: req.body.address || null,
      licenseNo: String(req.body.licenseNo).trim(),
      licenseClass: req.body.licenseClass || null,
      licenseExpiry: req.body.licenseExpiry,
      employmentType: req.body.employmentType || driver.employmentType,
      status: req.body.status || driver.status,
      languageSkills: req.body.languageSkills || driver.languageSkills,
      driverImage: image,
      notes: req.body.notes || driver.notes,
    };

    await driver.update(updates);
    res.json({ success: true, data: driver });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'NIC or License already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    const assignedBooking = await VehicleBooking.findOne({
      where: { driverId: driver.id },
      attributes: ['id', 'bookingNo', 'status'],
    });

    if (assignedBooking) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete driver with assigned booking ${assignedBooking.bookingNo || assignedBooking.id}`,
      });
    }

    try {
      await deleteImageFromSupabase(driver.driverImage);
    } catch (err) {
      console.error('Error deleting driver image:', err.message);
    }

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
