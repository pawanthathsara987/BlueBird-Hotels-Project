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

    // Fix ENUM for tour_inquiries.status — add 'canceled' if missing
    try {
      await sequelize.query(
        `ALTER TABLE tour_inquiries MODIFY COLUMN status ENUM('pending','progress','accepted','rejected','canceled') NOT NULL DEFAULT 'pending'`
      );
      console.log("✅ tour_inquiries.status ENUM patched");
    } catch (e) {
      // Ignore if already correct
    }

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