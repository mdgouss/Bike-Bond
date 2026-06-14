const mongoose = require('mongoose');

const RideParticipantSchema = new mongoose.Schema({
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
  bike: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bike'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  role: {
    type: String,
    enum: ['rider', 'sweep', 'lead', 'medic'],
    default: 'rider'
  },
  shareLocation: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  notes: String
}, {
  timestamps: true
});

// Compound index to prevent duplicate participation
RideParticipantSchema.index({ ride: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('RideParticipant', RideParticipantSchema);
