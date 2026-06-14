  const express = require('express');
const router = express.Router();
const {
  getMyBikes,
  getBike,
  addBike,
  updateBike,
  deleteBike,
  uploadPhotos,
  setPrimaryBike
} = require('../controllers/bikeController');
const { protect } = require('../middleware/auth');
const { uploadBikePhotos } = require('../middleware/upload');

router.route('/')
  .get(protect, getMyBikes)
  .post(protect, addBike);

router.route('/:id')
  .get(getBike)
  .put(protect, updateBike)
  .delete(protect, deleteBike);

router.put('/:id/photos', protect, uploadBikePhotos, uploadPhotos);
router.put('/:id/primary', protect, setPrimaryBike);

module.exports = router;
