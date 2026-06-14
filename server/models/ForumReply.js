const mongoose = require('mongoose');

const ForumReplySchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  images: [String],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  parentReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumReply'
  },
  isAcceptedAnswer: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

ForumReplySchema.index({ post: 1, createdAt: 1 });

module.exports = mongoose.model('ForumReply', ForumReplySchema);
