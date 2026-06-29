import 'dotenv/config';
import sequelize from './config/database.js';
import { QueryTypes } from 'sequelize';

async function test() {
    try {
        const tables = ['room', 'customer', 'booking', 'booked_rooms'];
        for (const table of tables) {
            const result = await sequelize.query(`DESCRIBE ${table}`, { type: QueryTypes.SELECT });
            console.log(`COLUMNS FOR ${table.toUpperCase()}:`, result.map(c => c.Field));
        }
        process.exit(0);
    } catch (e) {
        console.error("ERROR:", e);
        process.exit(1);
    }
}
test();
