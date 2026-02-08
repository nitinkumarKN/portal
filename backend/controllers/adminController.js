import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import ApprovalLog from '../models/ApprovalLog.js';
import { sendEmail } from '../utils/sendEmail.js';
import { createNotification } from './notificationController.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const placedStudents = await StudentProfile.countDocuments({ placed: true });
    const totalCompanies = await Company.countDocuments({ approved: true });
    const totalJobs = await Job.countDocuments({ approved: true });
    const totalApplications = await Application.countDocuments();

    const branchWisePlacement = await StudentProfile.aggregate([
      {
        $group: {
          _id: '$branch',
          total: { $sum: 1 },
          placed: {
            $sum: { $cond: ['$placed', 1, 0] }
          }
        }
      }
    ]);

    const applicationsByStatus = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalStudents,
      placedStudents,
      unplacedStudents: totalStudents - placedStudents,
      totalCompanies,
      totalJobs,
      totalApplications,
      placementPercentage: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(2) : 0,
      branchWisePlacement,
      applicationsByStatus
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ==================== COMPANY APPROVAL ====================

export const getPendingCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    console.log('Fetching pending companies...'); // Debug log

    const query = { approvalStatus: 'Pending' };
    
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } }
      ];
    }

    const companies = await Company.find(query)
      .populate('userId', 'name email createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Company.countDocuments(query);

    console.log('Pending companies found:', companies.length); // Debug log
    console.log('Total:', total); // Debug log

    res.json({
      companies,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching companies:', error); // Debug log
    res.status(400).json({ message: error.message });
  }
};

export const getCompanyDetails = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('userId', 'name email createdAt')
      .populate('approvedBy', 'name email');

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Get approval history
    const approvalHistory = await ApprovalLog.find({
      entityType: 'Company',
      entityId: company._id
    })
      .populate('performedBy', 'name email')
      .sort({ timestamp: -1 });

    res.json({
      company,
      approvalHistory
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const approveCompany = async (req, res) => {
  try {
    const { notes } = req.body;
    const company = await Company.findById(req.params.id).populate('userId');

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (company.approvalStatus === 'Approved') {
      return res.status(400).json({ message: 'Company already approved' });
    }

    const previousStatus = company.approvalStatus;

    // Update company status
    company.approved = true;
    company.approvalStatus = 'Approved';
    company.approvedBy = req.user._id;
    company.approvedAt = new Date();
    company.lastReviewedAt = new Date();
    await company.save();

    // Create approval log
    await ApprovalLog.create({
      entityType: 'Company',
      entityId: company._id,
      action: 'Approved',
      performedBy: req.user._id,
      reason: notes,
      previousStatus,
      newStatus: 'Approved',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    // Send email notification
    await sendEmail({
      to: company.userId.email,
      subject: 'Company Registration Approved - Smart Placement Portal',
      text: `Dear ${company.companyName},

Congratulations! Your company registration has been approved by our placement team.

You can now:
- Post job openings
- View student applications
- Manage recruitment process

Login to your dashboard to get started.

Best regards,
Placement Team`
    });

    // Create in-app notification
    await createNotification(
      company.userId._id,
      'Company Approved',
      'Registration Approved',
      'Your company has been approved. You can now post jobs!',
      company._id,
      'Company'
    );

    res.json({
      message: 'Company approved successfully',
      company
    });
  } catch (error) {
    console.error('Company approval error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const rejectCompany = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ 
        message: 'Rejection reason is required (minimum 10 characters)' 
      });
    }

    const company = await Company.findById(req.params.id).populate('userId');

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const previousStatus = company.approvalStatus;

    // Update company status
    company.approved = false;
    company.approvalStatus = 'Rejected';
    company.rejectedReason = reason;
    company.lastReviewedAt = new Date();
    await company.save();

    // Create approval log
    await ApprovalLog.create({
      entityType: 'Company',
      entityId: company._id,
      action: 'Rejected',
      performedBy: req.user._id,
      reason,
      previousStatus,
      newStatus: 'Rejected'
    });

    // Send email notification
    await sendEmail({
      to: company.userId.email,
      subject: 'Company Registration Status - Smart Placement Portal',
      text: `Dear ${company.companyName},

Thank you for your interest in our placement portal.

After careful review, we are unable to approve your registration at this time.

Reason: ${reason}

You may contact our placement office for clarification or resubmit your application after addressing the concerns.

Best regards,
Placement Team`
    });

    // Create in-app notification
    await createNotification(
      company.userId._id,
      'System',
      'Registration Not Approved',
      `Your company registration was not approved. Reason: ${reason}`,
      company._id,
      'Company'
    );

    res.json({
      message: 'Company rejected',
      company
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ==================== JOB APPROVAL ====================

export const getPendingJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    console.log('Fetching pending jobs...'); // Debug log

    // Query for jobs that are pending approval
    const query = {
      $or: [
        { approvalStatus: 'Pending' },
        { status: 'Pending Approval', approved: false }
      ]
    };
    
    if (search) {
      query.$and = [{
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { role: { $regex: search, $options: 'i' } }
        ]
      }];
    }

    const jobs = await Job.find(query)
      .populate('companyId', 'companyName industry')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    console.log('Pending jobs found:', jobs.length); // Debug log
    console.log('Total:', total); // Debug log

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching jobs:', error); // Debug log
    res.status(400).json({ message: error.message });
  }
};

export const getJobDetails = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('companyId')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Get approval history
    const approvalHistory = await ApprovalLog.find({
      entityType: 'Job',
      entityId: job._id
    })
      .populate('performedBy', 'name email')
      .sort({ timestamp: -1 });

    res.json({
      job,
      approvalHistory
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const approveJob = async (req, res) => {
  try {
    const { notes } = req.body;
    const job = await Job.findById(req.params.id)
      .populate('companyId')
      .populate('createdBy');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.approvalStatus === 'Approved') {
      return res.status(400).json({ message: 'Job already approved' });
    }

    // Verify company is approved
    const company = await Company.findById(job.companyId);
    if (!company.approved) {
      return res.status(400).json({ 
        message: 'Cannot approve job from unapproved company' 
      });
    }

    const previousStatus = job.approvalStatus;

    // Update job status
    job.approved = true;
    job.approvalStatus = 'Approved';
    job.status = 'Open';
    job.approvedBy = req.user._id;
    job.approvedAt = new Date();
    job.lastReviewedAt = new Date();
    await job.save();

    // Create approval log
    await ApprovalLog.create({
      entityType: 'Job',
      entityId: job._id,
      action: 'Approved',
      performedBy: req.user._id,
      reason: notes,
      previousStatus,
      newStatus: 'Approved'
    });

    // Send email notification
    await sendEmail({
      to: job.createdBy.email,
      subject: `Job Posting Approved - ${job.title}`,
      text: `Dear ${job.companyId.companyName},

Your job posting "${job.title}" has been approved and is now live on the portal.

Eligible students can now view and apply to this position.

Job Details:
- Position: ${job.title}
- Package: ₹${job.package} LPA
- Deadline: ${new Date(job.deadline).toLocaleDateString()}

Login to your dashboard to manage applications.

Best regards,
Placement Team`
    });

    // Create in-app notification
    await createNotification(
      job.createdBy._id,
      'Job Approved',
      'Job Posting Approved',
      `Your job posting "${job.title}" has been approved and is now visible to students`,
      job._id,
      'Job'
    );

    res.json({
      message: 'Job approved successfully',
      job
    });
  } catch (error) {
    console.error('Job approval error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const rejectJob = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ 
        message: 'Rejection reason is required (minimum 10 characters)' 
      });
    }

    const job = await Job.findById(req.params.id)
      .populate('companyId')
      .populate('createdBy');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const previousStatus = job.approvalStatus;

    // Update job status
    job.approved = false;
    job.approvalStatus = 'Rejected';
    job.status = 'Cancelled';
    job.rejectedReason = reason;
    job.lastReviewedAt = new Date();
    await job.save();

    // Create approval log
    await ApprovalLog.create({
      entityType: 'Job',
      entityId: job._id,
      action: 'Rejected',
      performedBy: req.user._id,
      reason,
      previousStatus,
      newStatus: 'Rejected'
    });

    // Send email notification
    await sendEmail({
      to: job.createdBy.email,
      subject: `Job Posting Status - ${job.title}`,
      text: `Dear ${job.companyId.companyName},

Your job posting "${job.title}" could not be approved at this time.

Reason: ${reason}

You may modify the job posting and resubmit for approval.

Best regards,
Placement Team`
    });

    // Create in-app notification
    await createNotification(
      job.createdBy._id,
      'System',
      'Job Not Approved',
      `Your job posting "${job.title}" was not approved. Reason: ${reason}`,
      job._id,
      'Job'
    );

    res.json({
      message: 'Job rejected',
      job
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getApprovalStats = async (req, res) => {
  try {
    const [
      pendingCompanies,
      approvedCompanies,
      rejectedCompanies,
      pendingJobs,
      approvedJobs,
      rejectedJobs
    ] = await Promise.all([
      Company.countDocuments({ approvalStatus: 'Pending' }),
      Company.countDocuments({ approvalStatus: 'Approved' }),
      Company.countDocuments({ approvalStatus: 'Rejected' }),
      Job.countDocuments({ approvalStatus: 'Pending' }),
      Job.countDocuments({ approvalStatus: 'Approved' }),
      Job.countDocuments({ approvalStatus: 'Rejected' })
    ]);

    // Recent approval activity
    const recentApprovals = await ApprovalLog.find()
      .populate('performedBy', 'name')
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      companies: {
        pending: pendingCompanies,
        approved: approvedCompanies,
        rejected: rejectedCompanies,
        total: pendingCompanies + approvedCompanies + rejectedCompanies
      },
      jobs: {
        pending: pendingJobs,
        approved: approvedJobs,
        rejected: rejectedJobs,
        total: pendingJobs + approvedJobs + rejectedJobs
      },
      recentApprovals
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await StudentProfile.find()
      .populate('userId', 'name email')
      .sort({ cgpa: -1 });

    res.json(students);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPlacementReport = async (req, res) => {
  try {
    const { startDate, endDate, branch, format = 'json' } = req.query;

    const matchStage = {};
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (branch) {
      matchStage.branch = branch;
    }

    const placementData = await StudentProfile.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          rollNo: 1,
          branch: 1,
          cgpa: 1,
          placed: 1,
          placedCompany: 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    if (format === 'csv') {
      const csv = convertToCSV(placementData);
      res.header('Content-Type', 'text/csv');
      res.attachment('placement-report.csv');
      return res.send(csv);
    }

    res.json(placementData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCompanyWiseReport = async (req, res) => {
  try {
    const report = await Application.aggregate([
      {
        $match: { status: 'Selected' }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $lookup: {
          from: 'companies',
          localField: 'job.companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $group: {
          _id: '$company._id',
          companyName: { $first: '$company.companyName' },
          totalHired: { $sum: 1 },
          avgPackage: { $avg: '$job.package' },
          maxPackage: { $max: '$job.package' }
        }
      },
      { $sort: { totalHired: -1 } }
    ]);

    res.json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User activated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate('userId', 'name email isActive')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(companies);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const toggleCompanyStatus = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate('userId');
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Toggle user account status
    const user = await User.findById(company.userId);
    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      message: `Company ${user.isActive ? 'activated' : 'deactivated'}`,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(val => 
      typeof val === 'string' ? `"${val}"` : val
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
};
