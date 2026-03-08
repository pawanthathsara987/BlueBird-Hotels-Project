import { Guest, Room, RoomBook, RoomPackage } from "../models/index.js";


// available room check
const availableRooms = async (req, res) => {
    try {
        const avlRooms = await Room.findAll({
            where: { rstatus: "available" },
            include: [
                {
                    model: RoomPackage,
                    attributes: ["id", "pname", "maxAdults", "maxKids", "pprice", "pimage"],
                }
            ]
        });

        if (!avlRooms || avlRooms.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No record found",
            });
        }

        console.log(avlRooms);

        return res.status(200).json({
            success: true,
            message: "Record Found",
            avlRooms,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong in internal server",  
            error: error.message,
        });
    }
};

//available package
import sequelize from "../config/database.js";

const getAllPackages = async (req, res) => {
    try {
        const packages = await sequelize.query(`
            SELECT 
                p.id,
                p.pname,
                p.pprice,
                p.pimage,
                p.maxAdults,
                p.maxKids,
                COUNT(CASE WHEN r.rstatus = 'available' THEN 1 END) AS availableRooms
            FROM room_package p
            LEFT JOIN rooms r ON p.id = r.packageId
            GROUP BY p.id
        `, { type: sequelize.QueryTypes.SELECT });

        res.status(200).json({
            success: true,
            avlPackage: packages
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};


// Booking controller
const createBooking = async (req, res) => {
    
    try {
        const { name, email, country, phone, roomNo, price, checkIn, checkOut, actualAdults, actualKids} = req.body;

        const guest = await Guest.create({
            name,
            email,
            country,
            pnumber: phone,
        });

        const booking = await RoomBook.create({
            guest_id: guest.id,
            roomId: roomNo,
            price,
            checkIn,
            checkOut,
            actualAdults,
            actualKids,
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


const updateBooking = async (req, res) => {

    try {
        
        const { id } = req.params;
        const { name, email, country, phone, roomNo, price, checkIn, checkOut, actualAdults, actualKids} = req.body;

        const booking = await RoomBook.findByPk(id);

        if (booking == "") {
            return res.status(401).json({
                success: false,
                message: "Booking not found",
            })
        }
        
        const updateguest = await Guest.update(
            {
                name,
                email,
                country,
                pnumber: phone,
            },
            {
                where: { id: booking.guest_id }
            }
        )

        const updateBooking = await RoomBook.update(
            {
                roomId: roomNo,
                price,
                checkIn,
                checkOut,
                actualAdults,
                actualKids,
            },
            {
                where: { booking_id: id }
            }
        )
    
        return res.status(201).json({
            success: true,
            message: "Booking and Guest updated successfully",
            updateBooking,
            updateguest
        })
        

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
    deleteBookingById,
    updateBooking,
    availableRooms,
    getAllPackages
}