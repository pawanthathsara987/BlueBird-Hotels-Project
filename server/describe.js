import 'dotenv/config';
import sequelize from './src/config/database.js';
import { QueryTypes } from 'sequelize';

async function run() {
  try {
    const rows = await sequelize.query("SELECT * FROM vehicle_rental_policies WHERE id = 1", { type: QueryTypes.SELECT });
    console.log("Current row in DB:", rows[0]);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}
run();
