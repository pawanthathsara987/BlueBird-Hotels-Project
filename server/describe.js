import 'dotenv/config';
import sequelize from './src/config/database.js';
import { QueryTypes } from 'sequelize';

async function run() {
  try {
    const results = await sequelize.query("DESCRIBE airport_pickup", { type: QueryTypes.SELECT });
    console.log("Columns of airport_pickup:", results);
  } catch (err) {
    console.error("Error describing:", err);
  } finally {
    process.exit(0);
  }
}
run();
