/**
 * Migration: Add deletedAt column to drivers table for soft-delete support.
 *
 * Run once:  node scripts/add-driver-soft-delete.js
 *
 * This adds a nullable `deletedAt` DATETIME column that Sequelize's
 * paranoid mode uses to mark records as deleted without removing them.
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
       WHERE TABLE_NAME = 'drivers' AND COLUMN_NAME = 'deletedAt'`
    );

    if (results.length > 0) {
      console.log('ℹ️  deletedAt column already exists — skipping');
    } else {
      await sequelize.query(
        `ALTER TABLE drivers ADD COLUMN deletedAt DATETIME NULL DEFAULT NULL`
      );
      console.log('✅ Added deletedAt column to drivers table');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
