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
    console.log('✅ MySQL connected (AWS RDS)');

    // Run custom migrations to add nic and passportId to tour_inquiries
    try {
      await sequelize.query("ALTER TABLE tour_inquiries ADD COLUMN nic VARCHAR(50) NULL;");
      console.log('✅ Added nic column to tour_inquiries');
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE tour_inquiries ADD COLUMN passportId VARCHAR(50) NULL;");
      console.log('✅ Added passportId column to tour_inquiries');
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE airport_pickup ADD COLUMN flight_number VARCHAR(100) NULL;");
      console.log('✅ Added flight_number column to airport_pickup');
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE airport_pickup ADD COLUMN baggage_count INT NULL DEFAULT 0;");
      console.log('✅ Added baggage_count column to airport_pickup');
    } catch (e) {}
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS airport_pickup_vehicles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          vehicle_type VARCHAR(100) NOT NULL,
          passenger_count INT NOT NULL,
          baggage_count INT NOT NULL,
          price DOUBLE NOT NULL
        );
      `);
      console.log('✅ Created airport_pickup_vehicles table if not exists');
      
      const [results] = await sequelize.query("SELECT COUNT(*) as count FROM airport_pickup_vehicles;");
      if (results[0].count === 0) {
        await sequelize.query(`
          INSERT INTO airport_pickup_vehicles (vehicle_type, passenger_count, baggage_count, price) VALUES
          ('car', 4, 3, 25.00),
          ('mini_van', 8, 8, 45.00),
          ('mini_bus', 15, 15, 80.00);
        `);
        console.log('✅ Seeded default airport_pickup_vehicles');
      }
    } catch (e) {}

    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS room_stay_reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          booking_id INT NOT NULL,
          booked_room_id INT NOT NULL UNIQUE,
          customer_id INT NOT NULL,
          hotel_rating INT NOT NULL,
          room_rating INT NOT NULL,
          comment TEXT NULL,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT fk_room_stay_reviews_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT fk_room_stay_reviews_booked_room FOREIGN KEY (booked_room_id) REFERENCES booked_rooms(id) ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT fk_room_stay_reviews_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE ON UPDATE CASCADE
        );
      `);
      console.log('✅ Created room_stay_reviews table if not exists');
    } catch (e) {}

    await seedDefaultSettings();

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