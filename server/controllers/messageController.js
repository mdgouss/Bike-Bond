const Message = require('../models/Message');
const GroupChat = require('../models/GroupChat');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');

// ============ PRIVATE MESSAGES ============

// @desc    Get conversations list
// @route   GET /api/messages
// @access  Private
exports.getConversations = asyncHandler(async (req, res) => {
  // Get unique users the current user has chatted with
  const messages = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: req.user._id },
          { receiver: req.user._id }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$sender', req.user._id] },
            '$receiver',
            '$sender'
          ]
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [
                { $eq: ['$receiver', req.user._id] },
                { $eq: ['$read', false] }
              ]},
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  // Populate user details
  const conversations = await User.populate(messages, {
    path: '_id',
    select: 'name avatar lastActive'
  });

  res.status(200).json({
    success: true,
    data: conversations.map(conv => ({
      user: conv._id,
      lastMessage: conv.lastMessage,
      unreadCount: conv.unreadCount
    }))
  });
});

// @desc    Get messages with a user
// @route   GET /api/messages/:userId
// @access  Private
exports.getMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const messages = await Message.find({
    $or: [
      { sender: req.user.id, receiver: req.params.userId },
      { sender: req.params.userId, receiver: req.user.id }
    ]
  })
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  // Mark as read
  await Message.updateMany(
    { sender: req.params.userId, receiver: req.user.id, read: false },
    { read: true, readAt: Date.now() }
  );

  res.status(200).json({
    success: true,
    data: messages.reverse()
  });
});

// @desc    Send private message
// @route   POST /api/messages/:userId
// @access  Private
exports.sendMessage = asyncHandler(async (req, res) => {
  const receiver = await User.findById(req.params.userId);

  if (!receiver) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const message = await Message.create({
    sender: req.user.id,
    receiver: req.params.userId,
    content: req.body.content,
    messageType: req.body.messageType || 'text',
    attachments: req.body.attachments
  });

  res.status(201).json({
    success: true,
    data: message
  });
});

// ============ GROUP CHATS ============

// @desc    Get my group chats
// @route   GET /api/messages/groups
// @access  Private
exports.getGroupChats = asyncHandler(async (req, res) => {
  const chats = await GroupChat.find({
    members: req.user.id,
    isActive: true
  })
    .populate('ride', 'title startDate')
    .populate('members', 'name avatar')
    .sort('-updatedAt');

  res.status(200).json({
    success: true,
    data: chats
  });
});

// @desc    Get group chat messages
// @route   GET /api/messages/groups/:chatId
// @access  Private
exports.getGroupMessages = asyncHandler(async (req, res) => {
  const chat = await GroupChat.findById(req.params.chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  // Check if user is member
  if (!chat.members.includes(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Not a member of this chat'
    });
  }

  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const messages = await ChatMessage.find({ chat: chat._id })
    .populate('sender', 'name avatar')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  // Mark as read
  await ChatMessage.updateMany(
    { chat: chat._id, 'readBy.user': { $ne: req.user.id } },
    { $push: { readBy: { user: req.user.id } } }
  );

  res.status(200).json({
    success: true,
    data: {
      chat,
      messages: messages.reverse()
    }
  });
});

// @desc    Send group message
// @route   POST /api/messages/groups/:chatId
// @access  Private
exports.sendGroupMessage = asyncHandler(async (req, res) => {
  const chat = await GroupChat.findById(req.params.chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  if (!chat.members.includes(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'Not a member of this chat'
    });
  }

  const message = await ChatMessage.create({
    chat: chat._id,
    sender: req.user.id,
    content: req.body.content,
    messageType: req.body.messageType || 'text',
    attachments: req.body.attachments,
    readBy: [{ user: req.user.id }]
  });

  await message.populate('sender', 'name avatar');

  // Update chat timestamp
  chat.updatedAt = Date.now();
  await chat.save();

  res.status(201).json({
    success: true,
    data: message
  });
});

// @desc    Create group chat
// @route   POST /api/messages/groups
// @access  Private
exports.createGroupChat = asyncHandler(async (req, res) => {
  const chat = await GroupChat.create({
    name: req.body.name,
    admin: req.user.id,
    members: [req.user.id, ...req.body.members]
  });

  await chat.populate('members', 'name avatar');

  res.status(201).json({
    success: true,
    data: chat
  });
});

// @desc    Leave group chat
// @route   DELETE /api/messages/groups/:chatId/leave
// @access  Private
exports.leaveGroupChat = asyncHandler(async (req, res) => {
  const chat = await GroupChat.findById(req.params.chatId);

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  chat.members = chat.members.filter(m => m.toString() !== req.user.id);
  await chat.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});
