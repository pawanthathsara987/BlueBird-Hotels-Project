/**
 * Migration: Add workingMinutes column to attendance table.
 *
 * Run once:  node scripts/add-working-minutes-to-attendance.js
 */
import dotenv from 'dotenv';
dotenv.config();

const { default: sequelize } = await import('../src/config/database.js');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Check if column already exists
    const [results] = await sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'attendance' AND COLUMN_NAME = 'workingMinutes'`
    );

    if (results.length > 0) {
      console.log('ℹ️  workingMinutes column already exists — skipping');
    } else {
      await sequelize.query(
        `ALTER TABLE attendance ADD COLUMN workingMinutes INT NOT NULL DEFAULT 0`
      );
      console.log('✅ Added workingMinutes column to attendance table');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
