import express from 'express';
import { 
   createBooking,
   getAllBookings,
   getBookingById,
   deleteBookingById,
   updateBooking,
   availableRooms,
   getAvailablePackagesByDate 
} from '../controllers/booking/roomBookingController.js';

import { getAllPackages } from '../controllers/admin/packageController.js';

const router = express.Router();

router.post('/booking', createBooking);
router.get('/bookings', getAllBookings);
router.get('/booking/:id', getBookingById);
router.delete('/booking/:id', deleteBookingById);
router.put('/booking/:id', updateBooking);
router.get('/availableRooms', availableRooms);
router.get('/getAllPackages', getAllPackages);
router.get('/available-packages', getAvailablePackagesByDate );

export default router;