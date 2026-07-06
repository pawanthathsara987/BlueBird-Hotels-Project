import { Op } from 'sequelize';
import Vehicle from '../../models/vehicle/vehicleModel.js';
import VehicleBooking from '../../models/vehicle/VehicleBookingModel.js';
import Payment from '../../models/vehicle/paymentModel.js';

export const getVehicleReportDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Set up date filters
    const bookingWhere = {};
    const serviceWhere = {};
    
    if (startDate || endDate) {
      if (startDate && endDate) {
        bookingWhere.pickupDatetime = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        serviceWhere.performedAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      } else if (startDate) {
        bookingWhere.pickupDatetime = { [Op.gte]: new Date(startDate) };
        serviceWhere.performedAt = { [Op.gte]: new Date(startDate) };
      } else if (endDate) {
        bookingWhere.pickupDatetime = { [Op.lte]: new Date(endDate) };
        serviceWhere.performedAt = { [Op.lte]: new Date(endDate) };
      }
    }

    // 1. Fetch vehicle summary report
    const vehicles = await Vehicle.findAll({
      where: { status: { [Op.ne]: 'retired' } },
      include: [
        {
          model: VehicleBooking,
          as: 'bookings',
          where: bookingWhere,
          required: false,
          include: [
            {
              model: Payment,
              as: 'payments',
              required: false,
            }
          ]
        }
      ]
    });

    const vehicleSummary = vehicles.map(vehicle => {
      const bookingsList = vehicle.bookings || [];
      const totalBookings = bookingsList.length;
      
      // Calculate total revenue from payments
      let totalRevenue = 0;
      let totalDays = 0;
      
      bookingsList.forEach(booking => {
        if (booking.status !== 'cancelled' && booking.status !== 'expired' && booking.status !== 'payment_failed') {
          totalDays += booking.numDays || 0;
        }
        
        const paymentsList = booking.payments || [];
        paymentsList.forEach(payment => {
          if (payment.type !== 'refund') {
            totalRevenue += parseFloat(payment.amount || 0);
          } else {
            totalRevenue -= parseFloat(payment.amount || 0);
          }
        });
      });

      return {
        id: vehicle.id,
        plateNumber: vehicle.plateNumber,
        brand: vehicle.brand,
        model: vehicle.model,
        status: vehicle.status,
        pricePerDay: vehicle.pricePerDay,
        totalBookings,
        totalRevenue,
        totalDays,
      };
    });

    // 2. Fetch general booking statistics
    const bookings = await VehicleBooking.findAll({
      where: bookingWhere,
      include: [{ model: Payment, as: 'payments', required: false }]
    });

    const statusCounts = {};
    const typeCounts = { with_driver: 0, without_driver: 0 };
    let totalBookingRevenue = 0;

    bookings.forEach(b => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
      if (b.hireType === 'with_driver') {
        typeCounts.with_driver += 1;
      } else {
        typeCounts.without_driver += 1;
      }

      const payments = b.payments || [];
      payments.forEach(p => {
        if (p.type !== 'refund') {
          totalBookingRevenue += parseFloat(p.amount || 0);
        } else {
          totalBookingRevenue -= parseFloat(p.amount || 0);
        }
      });
    });

    const bookingStats = {
      totalCount: bookings.length,
      statusCounts,
      typeCounts,
      totalRevenue: totalBookingRevenue
    };

    // Service log summary removed

    return res.json({
      success: true,
      data: {
        vehicleSummary,
        bookingStats,
        // serviceSummary removed
      }
    });
  } catch (err) {
    console.error('getVehicleReportDashboard error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export default { getVehicleReportDashboard };
