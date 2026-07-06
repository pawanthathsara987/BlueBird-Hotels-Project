import VehicleRentalPolicy from '../../models/vehicle/vehicleRentalPolicyModel.js';

const SINGLETON_ID = 1;

const toNumber = (value) => Number(Number(value).toFixed(2));

const toInteger = (value) => {
  if (value === undefined || value === null || value === '') {
    return NaN;
  }

  return Number.parseInt(value, 10);
};

const toBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }

  return Boolean(value);
};

const normalizeText = (value) => (value === undefined || value === null ? null : String(value));

export const getVehicleRentalPolicy = async (req, res) => {
  try {
    const [policy] = await VehicleRentalPolicy.findOrCreate({
      where: { id: SINGLETON_ID },
      defaults: { id: SINGLETON_ID },
    });

    res.json({ success: true, data: policy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateVehicleRentalPolicy = async (req, res) => {
  try {
    const payload = {
      lateReturnGraceHours: toInteger(req.body.lateReturnGraceHours),
      lateReturnFeePerHour: toNumber(req.body.lateReturnFeePerHour),
      lateReturnFullDayAfterHours: toInteger(req.body.lateReturnFullDayAfterHours),
      securityDepositAmount: toNumber(req.body.securityDepositAmount),
      includedKilometersPerDay: toInteger(req.body.includedKilometersPerDay),
      extraMileageFee: toNumber(req.body.extraMileageFee),
      extraMileageCurrency: normalizeText(req.body.extraMileageCurrency) || process.env.CURRENCY_TYPE || 'LKR',
      termsAndConditions: normalizeText(req.body.termsAndConditions),
    };

    const validationErrors = {};

    if (!Number.isFinite(payload.securityDepositAmount) || payload.securityDepositAmount < 0) {
      validationErrors.securityDepositAmount = 'Security deposit amount must be zero or a positive number.';
    }

    if (!Number.isFinite(payload.lateReturnGraceHours) || payload.lateReturnGraceHours < 0) {
      validationErrors.lateReturnGraceHours = 'Grace hours must be zero or a positive integer.';
    }

    if (!Number.isFinite(payload.lateReturnFeePerHour) || payload.lateReturnFeePerHour < 0) {
      validationErrors.lateReturnFeePerHour = 'Late return fee must be zero or a positive number.';
    }

    if (!Number.isFinite(payload.lateReturnFullDayAfterHours) || payload.lateReturnFullDayAfterHours < 0) {
      validationErrors.lateReturnFullDayAfterHours = 'Full-day cutoff must be zero or a positive integer.';
    }


    if (!Number.isFinite(payload.includedKilometersPerDay) || payload.includedKilometersPerDay < 0) {
      validationErrors.includedKilometersPerDay = 'Included kilometers must be zero or a positive integer.';
    }

    if (!Number.isFinite(payload.extraMileageFee) || payload.extraMileageFee < 0) {
      validationErrors.extraMileageFee = 'Extra mileage fee must be zero or a positive number.';
    }

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    const [policy] = await VehicleRentalPolicy.findOrCreate({
      where: { id: SINGLETON_ID },
      defaults: { id: SINGLETON_ID },
    });

    await policy.update(payload);

    res.json({ success: true, data: policy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  getVehicleRentalPolicy,
  updateVehicleRentalPolicy,
};