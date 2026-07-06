import cron from 'node-cron';
import { Op } from 'sequelize';
import VehicleBooking from '../models/vehicle/VehicleBookingModel.js';

// How long a booking can stay unpaid before it expires (in minutes)
const EXPIRY_MINUTES = 120; // 2 hours

/**
 * Expire vehicle bookings that have been in 'pending_payment' or 'payment_failed'
 * for longer than EXPIRY_MINUTES.
 *
 * Runs every 15 minutes.
 */
const expireVehicleBookings = async () => {
  try {
    const cutoff = new Date(Date.now() - EXPIRY_MINUTES * 60 * 1000);

    const [affectedCount] = await VehicleBooking.update(
      {
        status: 'expired',
        cancellationReason: `Auto-expired: deposit not paid within ${EXPIRY_MINUTES} minutes`,
      },
      {
        where: {
          status: { [Op.in]: ['pending_payment', 'payment_failed'] },
          createdAt: { [Op.lt]: cutoff },
        },
      }
    );

    if (affectedCount > 0) {
      console.log(`[CRON] Expired ${affectedCount} unpaid vehicle booking(s)`);
    }
  } catch (err) {
    console.error('[CRON] expireVehicleBookings error:', err);
  }
};

/**
 * Start the cron schedule.
 * Call once from server startup (index.js).
 */
export const startBookingExpiryJob = () => {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', expireVehicleBookings);
  console.log('⏰ Vehicle booking expiry cron started (every 15 min)');
};

export default startBookingExpiryJob;
