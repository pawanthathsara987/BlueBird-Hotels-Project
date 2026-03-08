import { Guest, Room, RoomBook } from "../models/index.js";

const createBooking = async (req, res) => {
    
    try {
        const { name, email, country, phone, roomNo, packageId, price, checkIn, checkOut} = req.body;

        const guest = await Guest.create({
            name,
            email,
            country,
            pnumber: phone,
        });

        const booking = await RoomBook.create({
            guest_id: guest.id,
            roomId: roomNo,
            packageId,
            price,
            checkIn,
            checkOut,
        });

        return res.status(201).json({
            success: true,
            message: "Booking add Successfull",
            guest,
            booking,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something wrong in internal server",  
            error: error,
        });
    }
}

const getAllBookings = async (req, res) => {

    try {
        const bookings = await RoomBook.findAll({
            include: [
                {
                    model: Guest,
                    attributes: [ "id", "name", "email", "country", "pnumber" ],
                }
            ]
        });

        if (bookings == "") {
            return res.status(401).json({
                success: true,
                message: "No record found",
                bookings,
            });
        }

        return res.status(201).json({
            success: true,
            message: "Records Found",
            bookings,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something wrong in internal server",  
            error: error,
        });
    }
}

const getBookingById = async (req, res) => {
    try {
        // const { id } = req.params;
        const id = req.params.id;
        const booking = await RoomBook.findByPk(id, {
            include: [
                {
                    model: Guest,
                    attributes: [ "id", "name", "email", "country", "pnumber" ],
                }
            ]
        });

        if (booking == "") {
            return res.status(401).json({
                success: true,
                message: "No record Fouund",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Record Found",
            booking
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something wrong in internal server",  
            error: error,
        });
    }
}


const deleteBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleteBooking = await RoomBook.findByPk(id, {
            include: [
                { model: Guest }
            ]
        });
        
        if (deleteBooking == "") {
            return res.status(401).json({
                success: true,
                message: "No Record Found",
            });
        }

        await deleteBooking.Guest.destroy();

        return res.status(201).json({
            success: true,
            message: "Booking Delete SuccessFull",
            deleteBooking
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something wrong in internal server",  
            error: error,
        });
    }
}

export {
    createBooking,
    getAllBookings,
    getBookingById,
    deleteBookingById
}