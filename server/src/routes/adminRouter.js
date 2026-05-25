import express from 'express';

import {
    addAmenitie, getAllAmenities, updateAmenitie, deleteAmenitie,
    AmenitieswithAssignRoom
} from "./../controllers/admin/amenitiesController.js";

import { addRoom, updateRoom, deleteRoom, getAllRooms, searchRooms } from "../controllers/admin/roomController.js";
import {getAllRoomTypes, createRoomType, updateRoomType, deleteRoomType } from "../controllers/admin/roomTypeController.js";
import { getAllOccupancyTypes } from "../controllers/admin/occupancyTypeController.js";
import { getAllBoardTypes } from "../controllers/admin/boardTypeController.js";
import { upload } from "../controllers/admin/imageUploadController.js";
import { getAllRoomPrices, getRoomPriceMetadata, createRoomPrice, updateRoomPrice, deleteRoomPrice } from "../controllers/admin/roomPriceController.js";

const router = express.Router();

console.log("✅ Admin routes loaded");

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

// Board Type routes
router.get('/board-types', getAllBoardTypes);

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