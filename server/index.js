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
// Reload trigger comment