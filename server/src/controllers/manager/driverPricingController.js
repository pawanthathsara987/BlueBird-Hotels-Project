import DriverPricingSetting from '../../models/vehicle/driverPricingModel.js';

const SINGLETON_ID = 1;

const toPrice = (value) => Number(Number(value).toFixed(2));

export const getDriverPrice = async (req, res) => {
  try {
    const [setting] = await DriverPricingSetting.findOrCreate({
      where: { id: SINGLETON_ID },
      defaults: { id: SINGLETON_ID, driverPricePerDay: 0 },
    });

    res.json({ success: true, data: setting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateDriverPrice = async (req, res) => {
  try {
    const price = toPrice(req.body.driverPricePerDay);

    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: { driverPricePerDay: 'Driver price per day must be a positive number.' },
      });
    }

    const [setting] = await DriverPricingSetting.findOrCreate({
      where: { id: SINGLETON_ID },
      defaults: { id: SINGLETON_ID, driverPricePerDay: price },
    });

    await setting.update({ driverPricePerDay: price });

    res.json({ success: true, data: setting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  getDriverPrice,
  updateDriverPrice,
};