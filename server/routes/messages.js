const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  getGroupChats,
  getGroupMessages,
  sendGroupMessage,
  createGroupChat,
  leaveGroupChat
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// Private messages
router.get('/', protect, getConversations);
router.route('/:userId')
  .get(protect, getMessages)
  .post(protect, sendMessage);

// Group chats
router.route('/groups')
  .get(protect, getGroupChats)
  .post(protect, createGroupChat);

router.route('/groups/:chatId')
  .get(protect, getGroupMessages)
  .post(protect, sendGroupMessage);

router.delete('/groups/:chatId/leave', protect, leaveGroupChat);

module.exports = router;
