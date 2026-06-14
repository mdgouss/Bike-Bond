const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  category: {
    type: String,
    required: true,
    enum: ['bike', 'helmet', 'jacket', 'gloves', 'boots', 'accessories', 'parts', 'luggage', 'electronics', 'other']
  },
  description: {
    type: String,
    required: true,
    maxlength: 3000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  isNegotiable: {
    type: Boolean,
    default: true
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'for-parts'],
    required: true
  },
  brand: String,
  photos: {
    type: [String],
    validate: [arr => arr.length <= 10, 'Maximum 10 photos allowed']
  },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true }
  },
  // For bikes
  bikeDetails: {
    make: String,
    model: String,
    year: Number,
    kmDriven: Number,
    registrationNumber: String
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'reserved', 'expired', 'removed'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days
  }
}, {
  timestamps: true
});

// Index for searching
ListingSchema.index({ title: 'text', description: 'text' });
ListingSchema.index({ category: 1, status: 1, createdAt: -1 });
ListingSchema.index({ 'location.city': 1, 'location.state': 1 });

module.exports = mongoose.model('Listing', ListingSchema);
