import express from 'express';
import { getAvailableRooms } from '../controllers/reception/dashboardController.js';

const router = express.Router();

router.get('/available-rooms', getAvailableRooms);

export default router;