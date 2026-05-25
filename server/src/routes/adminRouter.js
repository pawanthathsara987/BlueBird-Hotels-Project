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
    getAllPackageimages,
} from '../controllers/admin/packageImageController.js';

import { addRoom, updateRoom, deleteRoom, getAllRooms, searchRooms } from "../controllers/admin/roomController.js";
import {getAllRoomTypes, createRoomType, updateRoomType, deleteRoomType } from "../controllers/admin/roomTypeController.js";
import { getAllOccupancyTypes } from "../controllers/admin/occupancyTypeController.js";
import { getAllRoomPrices, getRoomPriceMetadata, createRoomPrice, updateRoomPrice, deleteRoomPrice } from "../controllers/admin/roomPriceController.js";

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
router.get("/packageimage", getAllPackageimages);

// Amenities routes
router.post('/amenitie', addAmenitie);
router.get('/amenities', getAllAmenities);
router.get('/amenitiesroom', AmenitieswithAssignRoom);
router.put('/amenitie/:id', updateAmenitie);
router.delete('/amenitie/:id', deleteAmenitie);

// Room Type routes
router.get('/room-types', getAllRoomTypes);
router.post('/room-type', upload.single("image"), createRoomType);
router.put('/room-type/:id', upload.single("image"), updateRoomType);
router.delete('/room-type/:id', deleteRoomType);

// Occupancy Type routes
router.get('/occupancy-types', getAllOccupancyTypes);

// Rooms routes
router.get('/rooms', getAllRooms);
router.get('/rooms/search/:query', searchRooms);
router.post('/rooms', addRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

// Room Price routes
router.get('/room-prices', getAllRoomPrices);
router.get('/room-prices/metadata', getRoomPriceMetadata);
router.post('/room-prices', createRoomPrice);
router.put('/room-prices/:id', updateRoomPrice);
router.delete('/room-prices/:id', deleteRoomPrice);

export default router;