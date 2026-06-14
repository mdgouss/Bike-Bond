const mongoose = require('mongoose');

const BikeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: {
    type: String,
    required: [true, 'Please provide bike brand'],
    enum: ['Royal Enfield', 'Bajaj', 'TVS', 'Hero', 'Honda', 'Yamaha', 'Suzuki', 'KTM', 'BMW', 'Kawasaki', 'Ducati', 'Harley-Davidson', 'Triumph', 'Jawa', 'Benelli', 'Aprilia', 'Other']
  },
  model: {
    type: String,
    required: [true, 'Please provide bike model']
  },
  year: {
    type: Number,
    required: [true, 'Please provide manufacturing year']
  },
  cc: {
    type: Number,
    required: [true, 'Please provide engine capacity']
  },
  color: String,
  registrationNumber: {
    type: String,
    uppercase: true
  },
  nickname: String,
  photos: [String],
  modifications: [String],
  totalKm: {
    type: Number,
    default: 0
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure only one primary bike per user
BikeSchema.pre('save', async function(next) {
  if (this.isPrimary) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
  next();
});

module.exports = mongoose.model('Bike', BikeSchema);
