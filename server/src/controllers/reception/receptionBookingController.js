import { BookedRoom } from '../../models/index.js';

async function setCheckIn(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Booking id is required'
            });
        }

        const booking = await BookedRoom.findByPk(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status === 'checked_in') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already checked in'
            });
        }

        if (booking.status === 'checked_out' || booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot check in a completed or cancelled booking'
            });
        }

        booking.status = 'checked_in';
        await booking.save();

        return res.status(200).json({
            success: true,
            message: 'Customer checked in successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error setting check-in status:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

async function setCheckOut(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Booking id is required'
            });
        }

        const booking = await BookedRoom.findByPk(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status === 'checked_out') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already checked out'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot check out a cancelled booking'
            });
        }

        if (booking.status !== 'checked_in') {
            return res.status(400).json({
                success: false,
                message: 'Only checked-in bookings can be checked out'
            });
        }

        booking.status = 'checked_out';
        await booking.save();

        return res.status(200).json({
            success: true,
            message: 'Customer checked out successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error setting check-out status:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export { setCheckIn, setCheckOut };