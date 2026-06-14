const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  findBuddies,
  getUserStats
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/', getUsers);
router.get('/buddies', protect, findBuddies);
router.get('/:id', getUser);
router.get('/:id/stats', getUserStats);

module.exports = router;
