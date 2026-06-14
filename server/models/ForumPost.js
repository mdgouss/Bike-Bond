const mongoose = require('mongoose');

const ForumPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'gear', 'maintenance', 'routes', 'safety', 'ladakh', 'north-east', 'rajasthan', 'south-india', 'beginners', 'events', 'off-topic']
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  tags: [String],
  images: [String],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for replies count
ForumPostSchema.virtual('repliesCount', {
  ref: 'ForumReply',
  localField: '_id',
  foreignField: 'post',
  count: true
});

// Text search index
ForumPostSchema.index({ title: 'text', content: 'text', tags: 'text' });
ForumPostSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('ForumPost', ForumPostSchema);
