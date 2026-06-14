const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  uploadAvatar
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadAvatar: uploadAvatarMiddleware } = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/avatar', protect, uploadAvatarMiddleware, uploadAvatar);

module.exports = router;
