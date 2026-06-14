const mongoose = require('mongoose');

const LiveLocationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  speed: Number, // km/h
  heading: Number, // degrees
  accuracy: Number, // meters
  battery: Number, // percentage
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Geospatial index
LiveLocationSchema.index({ location: '2dsphere' });
LiveLocationSchema.index({ ride: 1, user: 1 });

module.exports = mongoose.model('LiveLocation', LiveLocationSchema);
