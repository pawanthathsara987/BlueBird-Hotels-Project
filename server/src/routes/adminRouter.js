import express from 'express';
import { 
    createPackage, getAllPackages, updatePackage, deletePackage, upload
} from './../controllers/admin/packageController.js';

import {
    addAmenitie, getAllAmenities, updateAmenitie, deleteAmenitie
} from "./../controllers/admin/amenitiesController.js";

const router = express.Router();

console.log("✅ Admin routes loaded");

// Packages routes with multer middleware
router.post("/package", upload.single("pimage"), createPackage);
router.get("/packages", getAllPackages);
router.put("/package/:id", upload.single("pimage"), updatePackage);
router.delete("/package/:id", deletePackage);

// Amenities routes
router.post('/amenitie', addAmenitie);
router.get('/amenities', getAllAmenities);
router.put('/amenitie/:id', updateAmenitie);
router.delete('/amenitie/:id', deleteAmenitie);

export default router;