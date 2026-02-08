import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';
import { createNotification } from './notificationController.js';

export const getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id })
      .populate('userId', 'name email')
      .populate('approvedBy', 'name email');
    
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    res.json(company);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const postJob = async (req, res) => {
  try {
    console.log('Job posting request from user:', req.user._id);
    
    const company = await Company.findOne({ userId: req.user._id });

    if (!company) {
      console.log('Company profile not found for user:', req.user._id);
      return res.status(404).json({ message: 'Company profile not found' });
    }

    console.log('Company found:', company.companyName, 'Approved:', company.approved, 'Status:', company.approvalStatus);

    // Check approval status
    if (!company.approved || company.approvalStatus !== 'Approved') {
      return res.status(403).json({ 
        message: 'Your company must be approved by admin before posting jobs. Please contact the placement office or wait for approval.' 
      });
    }

    const {
      title,
      description,
      role,
      employmentType,
      jobMode,
      numberOfOpenings,
      location,
      package: packageAmount,
      stipend,
      bond,
      eligibility,
      requiredSkills,
      preferredSkills,
      deadline,
      selectionProcess,
      status
    } = req.body;

    // Validation
    if (!title || !description || !packageAmount || !deadline) {
      return res.status(400).json({ 
        message: 'Please provide all required fields' 
      });
    }

    // Check for duplicate job title
    const existingJob = await Job.findOne({ 
      companyId: company._id, 
      title: title.trim() 
    });

    if (existingJob) {
      return res.status(400).json({ 
        message: 'A job with this title already exists. Please use a different title.' 
      });
    }

    // Validate deadline
    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({ 
        message: 'Deadline must be a future date' 
      });
    }

    // Validate CGPA
    if (eligibility.minCGPA < 0 || eligibility.minCGPA > 10) {
      return res.status(400).json({ 
        message: 'CGPA must be between 0 and 10' 
      });
    }

    // Validate branches
    if (!eligibility.branches || eligibility.branches.length === 0) {
      return res.status(400).json({ 
        message: 'Please select at least one eligible branch' 
      });
    }

    const job = await Job.create({
      companyId: company._id,
      title: title.trim(),
      description,
      role,
      employmentType,
      jobMode,
      numberOfOpenings,
      location,
      package: packageAmount,
      stipend,
      bond,
      eligibility,
      requiredSkills: requiredSkills || [],
      preferredSkills: preferredSkills || [],
      deadline,
      selectionProcess: selectionProcess || [],
      status: status === 'Draft' ? 'Draft' : 'Pending Approval',
      approved: false,
      approvalStatus: status === 'Draft' ? 'Draft' : 'Pending',
      createdBy: req.user._id
    });

    console.log('Job created:', job._id, 'Status:', job.approvalStatus);

    // Create notification for admin if submitted for approval
    if (status !== 'Draft') {
      const admins = await User.find({ role: 'admin' });
      console.log('Notifying admins:', admins.length);
      
      for (const admin of admins) {
        await createNotification(
          admin._id,
          'Job Approved',
          'New Job Posted',
          `${company.companyName} posted a new job: ${title}`,
          job._id,
          'Job'
        );
      }
    }

    res.status(201).json({
      message: status === 'Draft' 
        ? 'Job saved as draft' 
        : 'Job submitted for admin approval',
      job
    });
  } catch (error) {
    console.error('Job posting error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'A job with this title already exists for your company' 
      });
    }
    
    res.status(400).json({ message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Cannot edit approved jobs (only close them)
    if (job.approved && job.status === 'Open') {
      return res.status(400).json({ 
        message: 'Cannot edit approved jobs. You can only close them.' 
      });
    }

    Object.assign(job, req.body);
    
    // If resubmitting rejected job, reset approval status
    if (req.body.status === 'Pending Approval') {
      job.approved = false;
      job.approvalStatus = 'Pending';
      job.approvedBy = null;
      job.approvedAt = null;
      job.rejectedReason = null;
      job.rejectedBy = null;
      job.rejectedAt = null;
      job.resubmissionCount = (job.resubmissionCount || 0) + 1;

      // Notify admins about resubmission
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification(
          admin._id,
          'Job Resubmitted',
          'Job Pending Review',
          `${company.companyName} resubmitted job: ${job.title}`,
          job._id,
          'Job'
        );
      }
    }

    await job.save();

    res.json({
      message: job.resubmissionCount > 0 
        ? 'Job resubmitted for approval successfully'
        : 'Job updated successfully',
      job
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const closeJob = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    job.status = 'Closed';
    job.isActive = false;
    await job.save();

    res.json({ message: 'Job closed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Can only delete draft or rejected jobs
    if (job.status !== 'Draft' && job.status !== 'Cancelled') {
      return res.status(400).json({ 
        message: 'Can only delete draft or cancelled jobs' 
      });
    }

    await job.deleteOne();

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCompanyJobs = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });

    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const jobs = await Job.find({ companyId: company._id })
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getJobApplicants = async (req, res) => {
  try {
    console.log('Getting applicants for job:', req.params.jobId);
    console.log('User:', req.user._id);
    
    const { branch, minCGPA, status } = req.query;
    
    const job = await Job.findById(req.params.jobId).populate('companyId');

    if (!job) {
      console.log('Job not found');
      return res.status(404).json({ message: 'Job not found' });
    }

    const company = await Company.findOne({ userId: req.user._id });

    if (job.companyId._id.toString() !== company._id.toString()) {
      console.log('Not authorized - company mismatch');
      return res.status(403).json({ message: 'Not authorized' });
    }

    let filter = { jobId: req.params.jobId };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ appliedAt: -1 });

    console.log('Applications found:', applications.length);

    let filteredApplications = applications;

    if (branch || minCGPA) {
      filteredApplications = applications.filter(app => {
        const student = app.studentId;
        if (branch && student.branch !== branch) return false;
        if (minCGPA && student.cgpa < parseFloat(minCGPA)) return false;
        return true;
      });
    }

    res.json(filteredApplications);
  } catch (error) {
    console.error('Error getting applicants:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const job = await Job.findById(application.jobId).populate('companyId');

    if (job.companyId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    application.updatedBy = req.user._id;
    await application.save();

    // Mark student as placed if selected
    if (status === 'Selected') {
      await StudentProfile.findByIdAndUpdate(application.studentId._id, {
        placed: true,
        placedCompany: job.companyId.companyName
      });
    }

    // Send email notification
    await sendEmail({
      to: application.studentId.userId.email,
      subject: `Application Status Update - ${job.title}`,
      text: `Your application status has been updated to: ${status}`
    });

    // Create in-app notification
    await createNotification(
      application.studentId.userId._id,
      'Status Update',
      'Application Status Changed',
      `Your application for ${job.title} has been ${status.toLowerCase()}`,
      application._id,
      'Application'
    );

    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
