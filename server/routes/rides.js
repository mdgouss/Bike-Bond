const express = require('express');
const router = express.Router();
const {
  getRides,
  getRide,
  createRide,
  updateRide,
  endRide,
  deleteRide,
  joinRide,
  leaveRide,
  getMyRides,
  addReview
} = require('../controllers/rideController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getRides)
  .post(protect, createRide);

router.get('/my', protect, getMyRides);

router.route('/:id')
  .get(getRide)
  .put(protect, updateRide)
  .delete(protect, deleteRide);

router.put('/:id/end', protect, endRide);
router.post('/:id/join', protect, joinRide);
router.delete('/:id/leave', protect, leaveRide);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
