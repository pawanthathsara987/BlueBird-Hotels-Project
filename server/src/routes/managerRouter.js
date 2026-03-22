import express from 'express';
import {
    createTourItem,
    getAllTourItems,
    getTourItem,
    updateTourItem,
    deleteTourItem
} from '../controllers/manager/tourItemController.js';

const router = express.Router();

console.log("✅ Manager routes loaded");

// Tour Items routes
router.post('/tour-items', createTourItem);
router.get('/tour-items', getAllTourItems);
router.get('/tour-items/:itemId', getTourItem);
router.put('/tour-items/:itemId', updateTourItem);
router.delete('/tour-items/:itemId', deleteTourItem);

export default router;
