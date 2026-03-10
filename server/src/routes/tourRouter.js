const express  = require('express');
const router    = express.Router();
const controller = require('../controllers/tourController');
const upload    = require('../middleware/upload');

router.post("/", upload.single("image"), controller.createTour);
router.get("/", controller.getAllTours);
router.get("/:id", controller.getTourById);
router.put("/:id", controller.updateTour);
router.delete("/:id", controller.deleteTour);

module.exports = router;