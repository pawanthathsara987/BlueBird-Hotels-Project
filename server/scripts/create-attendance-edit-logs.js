import dotenv from 'dotenv';
dotenv.config();

const { default: sequelize } = await import('../src/config/database.js');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Create attendance_edit_logs table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS attendance_edit_logs (
        editLogId INT AUTO_INCREMENT PRIMARY KEY,
        attendanceId INT NOT NULL,
        oldCheckIn DATETIME NULL,
        newCheckIn DATETIME NULL,
        oldCheckOut DATETIME NULL,
        newCheckOut DATETIME NULL,
        reason VARCHAR(255) NOT NULL,
        editedBy VARCHAR(100) NOT NULL,
        editedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (attendanceId) REFERENCES attendance (attendanceId) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ Created attendance_edit_logs table');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
