import mongoose from 'mongoose';

const approvalLogSchema = new mongoose.Schema({
  entityType: {
    type: String,
    enum: ['Company', 'Job'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'entityType'
  },
  action: {
    type: String,
    enum: ['Approved', 'Rejected', 'Resubmitted'],
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String
  },
  previousStatus: {
    type: String
  },
  newStatus: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true
});

approvalLogSchema.index({ entityType: 1, entityId: 1 });
approvalLogSchema.index({ performedBy: 1 });
approvalLogSchema.index({ timestamp: -1 });

export default mongoose.model('ApprovalLog', approvalLogSchema);
