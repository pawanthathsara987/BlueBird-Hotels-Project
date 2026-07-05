import 'dotenv/config';
import sequelize from '../src/config/database.js';

async function run() {
  console.log('Connecting to database...');
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    console.log('Attempting to drop next_service_due column...');
    try {
      await sequelize.query('ALTER TABLE vehicle_service_logs DROP COLUMN next_service_due;');
      console.log('Dropped column next_service_due successfully.');
    } catch (e) {
      console.warn('Could not drop next_service_due (might already be deleted):', e.message);
    }

    console.log('Attempting to drop next_service_mileage column...');
    try {
      await sequelize.query('ALTER TABLE vehicle_service_logs DROP COLUMN next_service_mileage;');
      console.log('Dropped column next_service_mileage successfully.');
    } catch (e) {
      console.warn('Could not drop next_service_mileage (might already be deleted):', e.message);
    }

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

run();
