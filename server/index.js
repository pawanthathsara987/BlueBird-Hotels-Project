import dotenv from 'dotenv';
dotenv.config();

const { default: app } = await import('./src/app.js');
const { default: sequelize } = await import('./src/config/database.js');
const { initModels } = await import('./src/models/index.js');
const { seedDefaultSettings } = await import('./src/models/attendance/AttendanceSetting.js');

initModels();

const PORT = process.env.PORT || process.env.SERVER_PORT || 3002;

async function startServer() {
  try {

    await sequelize.authenticate();
    console.log('✅ MySQL connected (Aiven)');

    await seedDefaultSettings();

    // ── Review table migrations ───────────────────────────────────────────────
    // room_reviews (renamed from room_stay_reviews)
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS room_reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          booking_id INT NOT NULL UNIQUE,
          customer_id INT NOT NULL,
          hotel_rating INT NOT NULL,
          comment TEXT,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL
        )
      `);
      // Copy any existing data from old table
      await sequelize.query(`
        INSERT IGNORE INTO room_reviews (id, booking_id, customer_id, hotel_rating, comment, createdAt, updatedAt)
        SELECT id, booking_id, customer_id, hotel_rating, comment, createdAt, updatedAt
        FROM room_stay_reviews
      `).catch(() => {}); // Ignore if old table doesn't exist
      console.log("✅ room_reviews table ready");
    } catch (e) { console.warn("room_reviews:", e.message); }

    // vehicle_reviews
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS vehicle_reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          vehicle_booking_id INT NOT NULL UNIQUE,
          customer_id INT NOT NULL,
          vehicle_rating INT NOT NULL,
          driver_rating INT,
          comment TEXT,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL
        )
      `);
      console.log("✅ vehicle_reviews table ready");
    } catch (e) { console.warn("vehicle_reviews:", e.message); }

    // tour_reviews
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS tour_reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          tour_booking_id INT NOT NULL UNIQUE,
          customer_id INT NOT NULL,
          tour_rating INT NOT NULL,
          guide_rating INT,
          comment TEXT,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL
        )
      `);
      console.log("✅ tour_reviews table ready");
    } catch (e) { console.warn("tour_reviews:", e.message); }

    // vehicle_refunds
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS vehicle_refunds (
          id INT AUTO_INCREMENT PRIMARY KEY,
          bookingId INT NOT NULL,
          bookingNo VARCHAR(50),
          refundRef VARCHAR(30) NOT NULL UNIQUE,
          isEligible TINYINT(1) NOT NULL DEFAULT 0,
          daysBeforePickup INT NOT NULL DEFAULT 0,
          depositAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
          refundAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
          status VARCHAR(30) NOT NULL DEFAULT 'requested',
          clientReason TEXT,
          managerNote TEXT,
          requestedAt DATETIME NOT NULL,
          processedAt DATETIME,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL
        )
      `);
      console.log("✅ vehicle_refunds table ready");
    } catch (e) { console.warn("vehicle_refunds:", e.message); }

    // tour_inquiries ENUM patch
    try {
      await sequelize.query(
        `ALTER TABLE tour_inquiries MODIFY COLUMN status ENUM('pending','progress','accepted','rejected','canceled') NOT NULL DEFAULT 'pending'`
      );
      console.log("✅ tour_inquiries.status ENUM patched");
    } catch (e) {}

    // await sequelize.sync({ alter: false }); // Keep startup read-only against existing tables
    console.log('✅ Models synced');

    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  }
}

startServer();