import dotenv from 'dotenv';
dotenv.config();

const { default: sequelize } = await import('../src/config/database.js');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    const [results] = await sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'vehicle_service_logs' AND COLUMN_NAME = 'deleted_at'`
    );

    if (results.length > 0) {
      console.log('ℹ️  deleted_at column already exists — skipping');
    } else {
      await sequelize.query(
        `ALTER TABLE vehicle_service_logs ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL`
      );
      console.log('✅ Added deleted_at column to vehicle_service_logs table');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
