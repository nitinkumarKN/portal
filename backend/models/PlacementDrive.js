import mongoose from 'mongoose';

const placementDriveSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  participatingCompanies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }],
  eligibilityCriteria: {
    minCGPA: {
      type: Number,
      min: 0,
      max: 10
    },
    branches: [{
      type: String,
      enum: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL']
    }],
    backlogs: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('PlacementDrive', placementDriveSchema);
