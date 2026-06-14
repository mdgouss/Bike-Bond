const mongoose = require('mongoose');

const WaypointSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lng: Number,
  order: Number
});

const RideSchema = new mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide ride title'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Please provide ride description'],
    maxlength: 2000
  },
  rideType: {
    type: String,
    enum: ['day-ride', 'weekend', 'multi-day', 'breakfast-ride', 'night-ride'],
    default: 'day-ride'
  },
  startLocation: {
    name: { type: String, required: true },
    address: String,
    lat: Number,
    lng: Number
  },
  endLocation: {
    name: { type: String, required: true },
    address: String,
    lat: Number,
    lng: Number
  },
  waypoints: [WaypointSchema],
  distance: {
    type: Number, // in kilometers
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  endDate: {
    type: Date
  },
  meetingTime: {
    type: String,
    required: true
  },
  maxRiders: {
    type: Number,
    default: 20,
    min: 2,
    max: 100
  },
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'challenging', 'extreme'],
    default: 'moderate'
  },
  terrain: [{
    type: String,
    enum: ['highway', 'city', 'mountain', 'off-road', 'coastal', 'desert']
  }],
  minCC: {
    type: Number,
    default: 0
  },
  requirements: [String],
  estimatedBudget: {
    type: Number // in INR
  },
  coverImage: String,
  photos: [String],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for participants count
RideSchema.virtual('participantsCount', {
  ref: 'RideParticipant',
  localField: '_id',
  foreignField: 'ride',
  count: true
});

// Index for searching
RideSchema.index({ title: 'text', description: 'text', tags: 'text' });
RideSchema.index({ startDate: 1 });
RideSchema.index({ 'startLocation.lat': 1, 'startLocation.lng': 1 });

module.exports = mongoose.model('Ride', RideSchema);
