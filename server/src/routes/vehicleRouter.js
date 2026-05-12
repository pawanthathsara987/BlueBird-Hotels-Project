import express from 'express';
import {
  getVehicles,
  getVehicle,
  checkAvailability,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  createBooking,
  getMyBookings,
  getBooking,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
  getPayment,
  processPayment,
  refundPayment,
} from '../controllers/manager/vehicleController.js';

import { auth, isManager } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getVehicles);
router.get('/admin/bookings', isManager, getAllBookings);
router.patch('/admin/bookings/:id/status', isManager, updateBookingStatus);
router.post('/admin/bookings/:id/refund', isManager, refundPayment);

router.post('/bookings', auth, createBooking);
router.get('/bookings/my', auth, getMyBookings);
router.get('/bookings/:id/payment', auth, getPayment);
router.post('/bookings/:id/pay', auth, processPayment);
router.get('/bookings/:id', auth, getBooking);
router.post('/bookings/:id/cancel', auth, cancelBooking);

router.post('/', isManager, createVehicle);
router.put('/:id', isManager, updateVehicle);
router.delete('/:id', isManager, deleteVehicle);

router.get('/:id/availability', checkAvailability);
router.get('/:id', getVehicle);

export default router;