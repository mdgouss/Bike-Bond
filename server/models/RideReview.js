const mongoose = require('mongoose');

const RideReviewSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 1000
  },
  photos: [String],
  highlights: [String],
  wouldRecommend: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// One review per user per ride
RideReviewSchema.index({ ride: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('RideReview', RideReviewSchema);
