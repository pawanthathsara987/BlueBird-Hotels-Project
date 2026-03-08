import express from 'express';
import { 
   createBooking,
   getAllBookings,
   getBookingById,
   deleteBookingById,
} from '../controllers/roomBookingController.js';

const router = express.Router();

router.post('/booking', createBooking);
router.get('/bookings', getAllBookings);
router.get('/booking/:id', getBookingById);
router.delete('/booking/:id', deleteBookingById);

export default router;