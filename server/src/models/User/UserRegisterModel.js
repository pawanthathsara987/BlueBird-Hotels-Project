import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

class UserRegisterModel extends Model { }

UserRegisterModel.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: "UserRegister",
    tableName: "user_registers",
    timestamps: true
});

export default UserRegisterModel;
