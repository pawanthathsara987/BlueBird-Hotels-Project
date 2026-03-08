// index.js
import dotenv from 'dotenv';
dotenv.config();

// Dynamic import AFTER dotenv has loaded
const { default: app } = await import('./src/app.js');
const { default: sequelize } = await import('./src/config/database.js');
const { initModels } = await import('./src/models/index.js');

initModels();

const PORT = process.env.SERVER_PORT || 3002;

async function startServer() {
  try {

    // await sequelize.sync({ force: false }); // ← set true to recreate table this will be lost data

    await sequelize.authenticate();
    console.log('✅ MySQL connected (AWS RDS)');

    await sequelize.sync({ alter: false });
    console.log('✅ Models synced');

    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  }
}

startServer();