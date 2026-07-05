import express from 'express';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import {
    addAmenitie, getAllAmenities, updateAmenitie, deleteAmenitie,
    AmenitieswithAssignRoom
} from "./../controllers/admin/amenitiesController.js";

import { addRoom, updateRoom, deleteRoom, getAllRooms, searchRooms } from "../controllers/admin/roomController.js";
import { getAllRoomTypes, getRoomTypeById, createRoomType, updateRoomType, deleteRoomType, deleteRoomTypeImage } from "../controllers/admin/roomTypeController.js";
import { getAllOccupancyTypes } from "../controllers/admin/occupancyTypeController.js";
import { getAllBoardTypes } from "../controllers/admin/boardTypeController.js";
import { upload } from "../controllers/admin/imageUploadController.js";
import { getAllRoomPrices, getRoomPriceMetadata, createRoomPrice, updateRoomPrice, deleteRoomPrice } from "../controllers/admin/roomPriceController.js";
import { getAllServiceCharges, updateServiceCharge } from "../controllers/admin/serviceChargeController.js";
import { getAllShopItems, getShopItemById, createShopItem, updateShopItem, deleteShopItem } from "../controllers/admin/shopController.js";
import { getAllShopCategories, createShopCategory, updateShopCategory, deleteShopCategory } from "../controllers/admin/shopCategoryController.js";

const router = express.Router();

router.get('/room-types',            getAllRoomTypes);
router.get('/room-type/:id',         getRoomTypeById);
router.get('/room-prices',           getAllRoomPrices);
router.get('/room-prices/metadata',  getRoomPriceMetadata);
router.get('/occupancy-types',       getAllOccupancyTypes);
router.get('/board-types',           getAllBoardTypes);
router.get('/shop-items',            getAllShopItems);
router.get('/shop-items/:id',        getShopItemById);
router.get('/shop-categories',       getAllShopCategories);

// ── All routes below require a valid admin JWT ────────────────────────────────
router.use(requireAuth);
router.use(requireRole('admin'));

// Amenities routes (admin only)
router.post('/amenitie', addAmenitie);
router.get('/amenities', getAllAmenities);
router.get('/amenitiesroom', AmenitieswithAssignRoom);
router.put('/amenitie/:id', updateAmenitie);
router.delete('/amenitie/:id', deleteAmenitie);

// Room Type routes (write operations — admin only)
router.post('/room-type', upload.array("images"), createRoomType);
router.put('/room-type/:id', upload.array("images"), updateRoomType);
router.delete('/room-type/:id', deleteRoomType);
router.delete('/room-type/:id/image', deleteRoomTypeImage);

// Rooms routes (admin only)
router.get('/rooms', getAllRooms);
router.get('/rooms/search/:query', searchRooms);
router.post('/rooms', addRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

// Room Price routes (write operations — admin only)
router.post('/room-prices', createRoomPrice);
router.put('/room-prices/:id', updateRoomPrice);
router.delete('/room-prices/:id', deleteRoomPrice);

// Service Charge routes (admin only)
router.get('/service-charges', getAllServiceCharges);
router.put('/service-charges/:id', updateServiceCharge);

// Shop Items routes (write operations — admin only)
router.post('/shop-items', upload.array('images'), createShopItem);
router.put('/shop-items/:id', upload.array('images'), updateShopItem);
router.delete('/shop-items/:id', deleteShopItem);

// Shop Categories routes (write operations — admin only)
router.post('/shop-categories', createShopCategory);
router.put('/shop-categories/:id', updateShopCategory);
router.delete('/shop-categories/:id', deleteShopCategory);


export default router;