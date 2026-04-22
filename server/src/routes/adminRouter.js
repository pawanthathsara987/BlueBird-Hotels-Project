import express from 'express';
import { 
    createPackage, getAllPackages, updatePackage, deletePackage, upload, packagesWithAvailableRoomCount
} from './../controllers/admin/packageController.js';

import {
    addAmenitie, getAllAmenities, updateAmenitie, deleteAmenitie,
    AmenitieswithAssignRoom
} from "./../controllers/admin/amenitiesController.js";
import {
    addImages,
    getPackageImagesByPackageId,
    updatePackageImage,
    deletePackageImage,
} from '../controllers/admin/packageImageController.js';

const router = express.Router();

console.log("✅ Admin routes loaded");

// Packages routes with multer middleware
router.post("/package", upload.single("pimage"), createPackage);
router.get("/packages", getAllPackages);
router.put("/package/:id", upload.single("pimage"), updatePackage);
router.delete("/package/:id", deletePackage);
router.get("/package/available-rooms", packagesWithAvailableRoomCount);

// package image upload
router.post("/packageimage", upload.array("pimage"), addImages);
router.get("/packageimage/:packageId", getPackageImagesByPackageId);
router.put("/packageimage/:id", upload.single("pimage"), updatePackageImage);
router.delete("/packageimage/:id", deletePackageImage);

// Amenities routes
router.post('/amenitie', addAmenitie);
router.get('/amenities', getAllAmenities);
router.get('/amenitiesroom', AmenitieswithAssignRoom);
router.put('/amenitie/:id', updateAmenitie);
router.delete('/amenitie/:id', deleteAmenitie);

// Rooms routes

export default router;