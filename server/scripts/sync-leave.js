import dotenv from 'dotenv';
dotenv.config();

const { default: sequelize } = await import('../src/config/database.js');
const { initModels } = await import('../src/models/index.js');

async function sync() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    const models = initModels();
    const { LeaveType, LeaveRequest } = models;
    
    // Create/alter tables
    await LeaveType.sync({ alter: true });
    console.log('✅ leave_types table synced');

    await LeaveRequest.sync({ alter: true });
    console.log('✅ leave_requests table synced');

    // Alter Attendance status ENUM in MySQL
    try {
      await sequelize.query(
        `ALTER TABLE attendance MODIFY COLUMN status ENUM('Present', 'Late', 'Absent', 'On Leave') DEFAULT 'Present'`
      );
      console.log('✅ Updated attendance status enum to include On Leave');
    } catch (e) {
      console.log('⚠️ Attendance status column alter result:', e.message);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
    process.exit(1);
  }
}

sync();
