const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupChat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'location', 'system'],
    default: 'text'
  },
  attachments: [String],
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Index for fetching chat messages
ChatMessageSchema.index({ chat: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
