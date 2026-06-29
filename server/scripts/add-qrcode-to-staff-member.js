/**
 * Migration: Add qrCodeUrl column to staff_members table.
 *
 * Run once:  node scripts/add-qrcode-to-staff-member.js
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
       WHERE TABLE_NAME = 'staff_members' AND COLUMN_NAME = 'qrCodeUrl'`
    );

    if (results.length > 0) {
      console.log('ℹ️  qrCodeUrl column already exists — skipping');
    } else {
      await sequelize.query(
        `ALTER TABLE staff_members ADD COLUMN qrCodeUrl VARCHAR(255) NULL DEFAULT NULL`
      );
      console.log('✅ Added qrCodeUrl column to staff_members table');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
