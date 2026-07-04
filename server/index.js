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
      await sequelize.query("ALTER TABLE roles ADD COLUMN officeStartTime VARCHAR(5) NULL;");
      console.log('✅ Added officeStartTime column to roles');
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE roles ADD COLUMN officeEndTime VARCHAR(5) NULL;");
      console.log('✅ Added officeEndTime column to roles');
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE roles ADD COLUMN gracePeriodMinutes INT NULL;");
      console.log('✅ Added gracePeriodMinutes column to roles');
    } catch (e) {}
    try {
      await sequelize.query("ALTER TABLE roles ADD COLUMN standardWorkingHours DECIMAL(4,1) NULL;");
      console.log('✅ Added standardWorkingHours column to roles');
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