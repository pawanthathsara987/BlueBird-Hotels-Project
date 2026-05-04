import express from 'express';
import { getAvailableRooms, todayCheckIns, todayCheckOuts, getocuupiedRooms } from '../controllers/reception/dashboardController.js';


const router = express.Router();

router.get('/available-rooms', getAvailableRooms);
router.get('/today-checkins', todayCheckIns);
router.get('/today-checkouts', todayCheckOuts);
router.get('/occupied-rooms', getocuupiedRooms);

export default router;