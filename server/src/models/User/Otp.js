import {Model, DataTypes} from "sequelize";
import sequelize from "../../config/database.js";

class Otp extends Model {}

Otp.init(
    {
        email : {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                isEmail: true
            }
        },

        otp : {
            type: DataTypes.STRING(6),
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: "Otp",
        tableName: "otp",
        timestamps: true
    }
);

export default Otp;