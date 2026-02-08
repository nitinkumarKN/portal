import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  industry: {
    type: String
  },
  website: {
    type: String
  },
  location: {
    type: String
  },
  approved: {
    type: Boolean,
    default: false,
    index: true
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedReason: {
    type: String
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Blocked'],
    default: 'Pending',
    index: true
  },
  resubmissionCount: {
    type: Number,
    default: 0
  },
  lastReviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Company', companySchema);
