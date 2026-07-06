import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/supun/Documents/Client_project/BlueBird-Hotels-Project/server/.env' });

const { default: sequelize } = await import('./config/database.js');
const { QueryTypes } = await import('sequelize');

async function run() {
  try {
    const dailyDate = '2026-07-04';
    const vehicleBookings = await sequelize.query(
      `SELECT vb.id, vb.bookingNo, v.brand, v.model, vb.totalPayable, vb.createdAt 
       FROM vehicle_booking vb
       LEFT JOIN vehicles v ON vb.vehicleId = v.id 
       LIMIT 5`,
      { type: QueryTypes.SELECT }
    );
    console.log("Vehicle Bookings Query Test:", vehicleBookings);

    const tourBookings = await sequelize.query(
      `SELECT tb.id, tb.bookingRef, t.packageName 
       FROM tour_bookings tb
       JOIN tour_inquiries ti ON tb.inquiryId = ti.id
       JOIN tours t ON ti.tourId = t.id
       LIMIT 5`,
      { type: QueryTypes.SELECT }
    );
    console.log("Tour Bookings Query Test:", tourBookings);

  } catch (err) {
    console.error("Error describing:", err);
  } finally {
    process.exit(0);
  }
}
run();
