import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Selected', 'Rejected'],
    default: 'Applied'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  coverLetter: {
    type: String,
    required: true
  },
  expectedSalary: {
    type: Number
  },
  availableFrom: {
    type: Date,
    required: true
  },
  referenceEmail: {
    type: String
  },
  agreeToTerms: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
});

applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
