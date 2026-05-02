import Customer from "../models/User/Customer.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function registerCustomer(req, res) {
    
    try {
        const data = req.body;

        if (data.password !== data.confirmPassword) {
            return res.status(400).json({ 
                message: "Passwords do not match" 
            });
        }

        const existingCustomer = await Customer.findOne({ where: { email: data.email } });
        if (existingCustomer) {
            return res.status(400).json({ 
                message: "Email already in exists" 
            });
        }

        const hashedPassword = await bcrypt.hashSync(data.password, 10);

        const newCustomer = await Customer.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,
            phoneNumber: data.phoneNumber
        });

        const userResponse = {
            id: newCustomer.customerId,
            firstName: newCustomer.firstName,
            lastName: newCustomer.lastName,
            email: newCustomer.email,
            phoneNumber: newCustomer.phoneNumber
        };

        res.status(201).json({ 
            message: "Customer registered successfully",
            user: userResponse
        });

    }catch (error) {
        console.error("Error registering customer:", error);
        res.status(500).json({ 
            message: "Internal server error" 
        });
    }
}

export async function loginCustomer(req, res) {
    try{
        const { email, password } = req.body;

        const customer = await Customer.findOne({ where: { email } });
        if (!customer) {
            return res.status(400).json({ 
                message: "Invalid email or password" 
            });
        }

        const isPasswordValid = await bcrypt.compare(password, customer.password);
        if (!isPasswordValid) {
            return res.status(400).json({ 
                message: "Invalid email or password" 
            });
        }

        const userResponse = {
            id: customer.customerId,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phoneNumber: customer.phoneNumber
        };

        const token = jwt.sign(userResponse, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ 
            message: "Customer logged in successfully",
            token: token,
            user: userResponse
        });

    }catch (error) {
        console.error("Error logging in customer:", error);
        res.status(500).json({ 
            message: "Internal server error" 
        });
    }
}