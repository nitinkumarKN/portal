import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  // Basic Details
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  role: {
    type: String,
    required: true
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Internship', 'Part-time', 'PPO'],
    default: 'Full-time'
  },
  jobMode: {
    type: String,
    enum: ['On-site', 'Remote', 'Hybrid'],
    default: 'On-site'
  },
  numberOfOpenings: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // Location
  location: {
    city: String,
    state: String,
    country: { type: String, default: 'India' }
  },
  
  // Compensation
  package: {
    type: Number,
    required: [true, 'Package is required'],
    min: [0, 'Package must be positive']
  },
  stipend: {
    amount: Number,
    currency: { type: String, default: 'INR' }
  },
  bond: {
    required: { type: Boolean, default: false },
    duration: String,
    details: String
  },
  
  // Eligibility
  eligibility: {
    minCGPA: {
      type: Number,
      required: true,
      min: [0, 'CGPA must be at least 0'],
      max: [10, 'CGPA cannot exceed 10']
    },
    branches: [{
      type: String,
      enum: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'ALL']
    }],
    graduationYears: [{
      type: Number
    }],
    maxBacklogs: {
      type: Number,
      default: 0
    }
  },
  
  requiredSkills: [{
    type: String,
    trim: true
  }],
  preferredSkills: [{
    type: String,
    trim: true
  }],
  
  // Application Settings
  deadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  selectionProcess: [{
    stage: {
      type: String,
      enum: ['Aptitude Test', 'Technical Round', 'HR Round', 'Group Discussion', 'Case Study']
    },
    description: String,
    duration: String
  }],
  
  // Job Status
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Open', 'Closed', 'Cancelled'],
    default: 'Draft'
  },
  approved: {
    type: Boolean,
    default: false,
    index: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
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
    enum: ['Draft', 'Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Draft',
    index: true
  },
  resubmissionCount: {
    type: Number,
    default: 0
  },
  lastReviewedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  viewCount: {
    type: Number,
    default: 0
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
jobSchema.index({ companyId: 1, title: 1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ status: 1, approved: 1 });
jobSchema.index({ 'eligibility.branches': 1 });
jobSchema.index({ 'eligibility.graduationYears': 1 });

// Prevent duplicate job titles for same company
jobSchema.index({ companyId: 1, title: 1 }, { unique: true });

// Auto-update status based on deadline
jobSchema.pre('save', function(next) {
  if (this.deadline < new Date() && this.status === 'Open') {
    this.status = 'Closed';
  }
  next();
});

export default mongoose.model('Job', jobSchema);
