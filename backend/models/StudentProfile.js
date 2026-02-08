import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  rollNo: {
    type: String,
    required: true,
    unique: true
  },
  branch: {
    type: String,
    required: true,
    enum: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL']
  },
  cgpa: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  skills: [{
    type: String
  }],
  resumeUrl: {
    type: String
  },
  resumePublicId: {
    type: String
  },
  phone: {
    type: String,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  placed: {
    type: Boolean,
    default: false
  },
  placedCompany: {
    type: String
  },
  profileComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('StudentProfile', studentProfileSchema);
