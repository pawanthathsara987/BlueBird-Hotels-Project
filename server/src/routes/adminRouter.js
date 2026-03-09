import express from 'express';
import { 
    createPackage, getAllPackages, updatePackage, deletePackage
} from './../controllers/admin/packageController.js';

const router = express.Router();


// Packages routes
router.post('/package/addPackage', createPackage);
router.get('/package/getPackages', getAllPackages);
router.put('/package/updatePackage/:id', updatePackage);
router.delete('/package/deletePackage/:id', deletePackage);

export default router;