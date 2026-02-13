import dotenv from 'dotenv';  // ✅ fixed typo
dotenv.config();

import app from './src/app.js';
import database from './src/config/database.js';  // ✅ fixed import name

const PORT = process.env.SERVER_PORT || 3002;

async function startServer() {
  try {
    // test DB connection first
    await database.getConnection();
    console.log('✅ MySQL connected (AWS RDS)');

    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  }
}

startServer();