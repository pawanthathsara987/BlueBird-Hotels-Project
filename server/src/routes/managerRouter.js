import express from 'express';
import {
    createTourItem,
    getAllTourItems,
    getTourItem,
    updateTourItem,
    deleteTourItem
} from '../controllers/manager/tourItemController.js';
import {
    createTour,
    getAllTours,
    getTourById,
    updateTour,
    deleteTour,
    upload as tourUpload
} from '../controllers/manager/tourController.js';

const router = express.Router();

console.log("✅ Manager routes loaded");

// Tour Items routes
router.post('/tour-items', createTourItem);
router.get('/tour-items', getAllTourItems);
router.get('/tour-items/:itemId', getTourItem);
router.put('/tour-items/:itemId', updateTourItem);
router.delete('/tour-items/:itemId', deleteTourItem);

// Tours routes
router.post('/tours', tourUpload.single('image'), createTour);
router.get('/tours', getAllTours);
router.get('/tours/:id', getTourById);
router.put('/tours/:id', tourUpload.single('image'), updateTour);
router.delete('/tours/:id', deleteTour);

export default router;
