const express = require('express');
const router = express.Router();
const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  markAsSold,
  toggleSave,
  getMyListings,
  getSavedListings,
  uploadPhotos
} = require('../controllers/marketplaceController');
const { protect } = require('../middleware/auth');
const { uploadListingPhotos } = require('../middleware/upload');

router.route('/')
  .get(getListings)
  .post(protect, createListing);

router.get('/my', protect, getMyListings);
router.get('/saved', protect, getSavedListings);

router.route('/:id')
  .get(getListing)
  .put(protect, updateListing)
  .delete(protect, deleteListing);

router.put('/:id/sold', protect, markAsSold);
router.put('/:id/save', protect, toggleSave);
router.put('/:id/photos', protect, uploadListingPhotos, uploadPhotos);

module.exports = router;
