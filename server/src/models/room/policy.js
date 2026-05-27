import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

class Policy extends Model { }

Policy.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    policy_name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Default Hotel Policy"
    },
    cancellation_policy: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    payment_policy: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    check_in_time: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "2:00 PM"
    },
    check_out_time: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "12:00 PM"
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: "Policy",
    tableName: 'hotel_policies',
    timestamps: true
});

export default Policy;
