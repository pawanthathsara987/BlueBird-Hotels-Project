import express from 'express';
import { getGalleryImages } from '../controllers/galleryController.js';

const galleryRouter = express.Router();

// Public route to fetch all gallery images
galleryRouter.get('/', getGalleryImages);

export default galleryRouter;
