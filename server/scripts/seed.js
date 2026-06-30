import 'dotenv/config';
import sequelize from '../src/config/database.js';
import { initModels, BoardType, ServiceCharge, Policy, OccupancyType, Role } from '../src/models/index.js';

async function seed() {
    try {
        console.log('Initializing database connection...');
        await sequelize.authenticate();
        initModels();
        console.log('✅ Connected to database.');

        // 1. Seed Board Types
        console.log('Seeding Board Types...');
        const boardTypes = [
            { type: "Room Only", icon: "hotel", tagline: "Room reservation only without meals included" },
            { type: "Bed & Breakfast", icon: "coffee", tagline: "Stay with delicious breakfast included every morning" },
            { type: "Half Board", icon: "utensils", tagline: "Stay with breakfast and choice of lunch or dinner included" },
            { type: "Full Board", icon: "restaurant", tagline: "All inclusive stay with breakfast, lunch, and dinner included" }
        ];
        for (const bt of boardTypes) {
            const [record, created] = await BoardType.findOrCreate({
                where: { type: bt.type },
                defaults: bt
            });
            if (created) {
                console.log(`+ Added Board Type: ${bt.type}`);
            }
        }

        // 2. Seed Service Charges
        console.log('Seeding Service Charges...');
        const serviceCharges = [
            { service_name: "Airport Pickup", service_Code: "AIRPORT_PICKUP", price: 15000.00, status: true },
            { service_name: "WiFi", service_Code: "WIFI", price: 0.00, status: true },
            { service_name: "Gym Access", service_Code: "GYM_ACCESS", price: 0.00, status: true },
            { service_name: "Spa Treatment", service_Code: "SPA", price: 5000.00, status: true }
        ];
        for (const sc of serviceCharges) {
            const [record, created] = await ServiceCharge.findOrCreate({
                where: { service_Code: sc.service_Code },
                defaults: sc
            });
            if (created) {
                console.log(`+ Added Service Charge: ${sc.service_name} (${sc.service_Code})`);
            }
        }

        // 3. Seed Hotel Policies
        console.log('Seeding Hotel Policies...');
        const policiesCount = await Policy.count();
        if (policiesCount === 0) {
            await Policy.create({
                policy_name: "Default Hotel Policy",
                cancellation_policy: "Free cancellation up to 48 hours prior to arrival. Cancellations made within 48 hours are subject to a one-night charge.",
                payment_policy: "No prepayment required. Secure your booking online and pay 50% advance on checkout to hold your luxury stay.",
                check_in_time: "2:00 PM",
                check_out_time: "12:00 PM",
                status: true
            });
            console.log('+ Created Default Hotel Policy');
        }

        // 4. Seed Occupancy Types
        console.log('Seeding Occupancy Types...');
        const occupancyTypes = [
            { type: "Single", capacity: 1 },
            { type: "Double", capacity: 2 },
            { type: "Triple", capacity: 3 },
            { type: "Quadruple", capacity: 4 }
        ];
        for (const ot of occupancyTypes) {
            const [record, created] = await OccupancyType.findOrCreate({
                where: { type: ot.type },
                defaults: ot
            });
            if (created) {
                console.log(`+ Added Occupancy Type: ${ot.type} (Capacity: ${ot.capacity})`);
            }
        }

        // 5. Seed Roles
        console.log('Seeding Staff Roles...');
        const roles = [
            { roleName: "admin" },
            { roleName: "manager" },
            { roleName: "receptionist" },
            { roleName: "staff" }
        ];
        for (const r of roles) {
            const [record, created] = await Role.findOrCreate({
                where: { roleName: r.roleName },
                defaults: r
            });
            if (created) {
                console.log(`+ Added Role: ${r.roleName}`);
            }
        }

        console.log('🎉 Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    }
    process.exit(0);
}
seed();
