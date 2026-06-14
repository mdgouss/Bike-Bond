const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  documentType: {
    type: String,
    required: true,
    enum: ['rc', 'driving_license', 'aadhar']
  },
  documentUrl: {
    type: String,
    required: true
  },
  documentNumber: {
    type: String,
    select: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date
}, {
  timestamps: true
});

// Update user verification status when approved
VerificationSchema.post('save', async function() {
  if (this.status === 'approved') {
    await mongoose.model('User').findByIdAndUpdate(this.user, { isVerified: true });
  }
});

module.exports = mongoose.model('Verification', VerificationSchema);
