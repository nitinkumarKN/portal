import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import { createNotification } from './notificationController.js';

export const getProfile = async (req, res) => {
  try {
    console.log('Getting profile for user:', req.user._id); // Debug log
    
    const profile = await StudentProfile.findOne({ userId: req.user._id })
      .populate('userId', 'name email');
    
    if (!profile) {
      console.log('Profile not found for user:', req.user._id); // Debug log
      return res.status(404).json({ message: 'Profile not found. Please contact admin.' });
    }

    console.log('Profile found:', profile); // Debug log
    res.json(profile);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { skills, phone, cgpa } = req.body;

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { skills, phone, cgpa, profileComplete: true },
      { new: true, runValidators: true }
    );

    res.json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const uploadResume = async (req, res) => {
  try {
    console.log('Resume upload request from user:', req.user._id);
    console.log('File:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const profile = await StudentProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // For now, store file locally (you can integrate Cloudinary later)
    const resumeUrl = `/uploads/${req.file.filename}`;

    profile.resumeUrl = resumeUrl;
    await profile.save();

    console.log('Resume uploaded successfully:', resumeUrl);

    res.json({
      message: 'Resume uploaded successfully',
      resumeUrl
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getEligibleJobs = async (req, res) => {
  try {
    console.log('========================================');
    console.log('GET ELIGIBLE JOBS REQUEST');
    console.log('========================================');
    console.log('User ID:', req.user._id);
    console.log('User Email:', req.user.email);
    
    const profile = await StudentProfile.findOne({ userId: req.user._id });

    if (!profile) {
      console.log('❌ Student profile not found');
      return res.status(404).json({ message: 'Profile not found' });
    }

    console.log('\n📋 Student Profile:');
    console.log('  Name:', profile.userId?.name);
    console.log('  Branch:', profile.branch);
    console.log('  CGPA:', profile.cgpa);
    console.log('  Skills:', profile.skills || []);
    console.log('  Resume:', profile.resumeUrl ? '✅ Uploaded' : '❌ Not uploaded');

    // Get all active and approved jobs
    const allJobs = await Job.find({
      approved: true,
      isActive: true,
      approvalStatus: 'Approved',
      status: 'Open',
      deadline: { $gte: new Date() }
    }).populate('companyId', 'companyName location industry');

    console.log('\n📊 Total approved active jobs:', allJobs.length);

    if (allJobs.length === 0) {
      console.log('❌ NO ACTIVE JOBS IN SYSTEM');
      return res.json([]);
    }

    console.log('\nActive Jobs:');
    allJobs.forEach((job, i) => {
      console.log(`  ${i + 1}. ${job.title} - Min CGPA: ${job.eligibility.minCGPA}, Branches: ${job.eligibility.branches.join(', ')}`);
    });

    // Filter jobs by eligibility
    const eligibleJobs = allJobs.filter(job => {
      const meetsCGPA = job.eligibility.minCGPA <= profile.cgpa;
      const meetsBranch = job.eligibility.branches.includes(profile.branch) || 
                         job.eligibility.branches.includes('ALL');
      
      console.log(`\n  Job: ${job.title}`);
      console.log(`    CGPA OK: ${meetsCGPA} (Required: ${job.eligibility.minCGPA}, Student: ${profile.cgpa})`);
      console.log(`    Branch OK: ${meetsBranch} (Required: ${job.eligibility.branches.join(', ')}, Student: ${profile.branch})`);
      console.log(`    Eligible: ${meetsCGPA && meetsBranch ? '✅' : '❌'}`);
      
      return meetsCGPA && meetsBranch;
    });

    console.log('\n✅ Eligible jobs after filtering:', eligibleJobs.length);

    // Get already applied job IDs
    const appliedJobIds = await Application.find({ 
      studentId: profile._id 
    }).distinct('jobId');

    console.log('Already applied to:', appliedJobIds.length, 'jobs');

    // Filter out applied jobs and add skill matching score
    const availableJobs = eligibleJobs
      .filter(job => !appliedJobIds.includes(job._id.toString()))
      .map(job => {
        const jobSkills = job.requiredSkills || [];
        const studentSkills = profile.skills || [];
        
        let matchedSkills = 0;
        if (jobSkills.length > 0 && studentSkills.length > 0) {
          matchedSkills = jobSkills.filter(skill => 
            studentSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()) || 
                                    skill.toLowerCase().includes(s.toLowerCase()))
          ).length;
        }
        
        const skillMatchPercentage = jobSkills.length > 0 
          ? Math.round((matchedSkills / jobSkills.length) * 100) 
          : 0;

        const cgpaScore = Math.min(100, Math.round((profile.cgpa / job.eligibility.minCGPA) * 100));
        const overallScore = Math.round((skillMatchPercentage * 0.6) + (cgpaScore * 0.4));

        return {
          ...job.toObject(),
          matchScore: {
            overall: overallScore,
            skillMatch: skillMatchPercentage,
            cgpaScore: cgpaScore,
            matchedSkills: matchedSkills
          }
        };
      })
      .sort((a, b) => b.matchScore.overall - a.matchScore.overall);

    console.log('\n🎯 Final available jobs:', availableJobs.length);
    console.log('========================================\n');

    res.json(availableJobs);
  } catch (error) {
    console.error('❌ Error getting eligible jobs:', error);
    res.status(400).json({ message: error.message });
  }
};

export const applyJob = async (req, res) => {
  try {
    const { coverLetter, expectedSalary, availableFrom, referenceEmail, agreeToTerms } = req.body;

    // Validation
    if (!coverLetter || coverLetter.trim().length < 50) {
      return res.status(400).json({ 
        message: 'Cover letter must be at least 50 characters' 
      });
    }

    if (!availableFrom) {
      return res.status(400).json({ 
        message: 'Please specify when you can join' 
      });
    }

    if (!agreeToTerms) {
      return res.status(400).json({ 
        message: 'You must agree to the terms and conditions' 
      });
    }

    const profile = await StudentProfile.findOne({ userId: req.user._id }).populate('userId', 'name');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (!profile.resumeUrl) {
      return res.status(400).json({ 
        message: 'Please upload your resume before applying to jobs' 
      });
    }

    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.approved || job.status !== 'Open') {
      return res.status(400).json({ 
        message: 'This job is not accepting applications' 
      });
    }

    // Check eligibility
    if (profile.cgpa < job.eligibility.minCGPA) {
      return res.status(400).json({ 
        message: `Minimum CGPA required: ${job.eligibility.minCGPA}. Your CGPA: ${profile.cgpa}` 
      });
    }

    if (!job.eligibility.branches.includes(profile.branch) && !job.eligibility.branches.includes('ALL')) {
      return res.status(400).json({ 
        message: `Your branch (${profile.branch}) is not eligible. Required: ${job.eligibility.branches.join(', ')}` 
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId: req.params.jobId,
      studentId: profile._id
    });

    if (existingApplication) {
      return res.status(400).json({ 
        message: 'You have already applied to this job' 
      });
    }

    const application = await Application.create({
      jobId: req.params.jobId,
      studentId: profile._id,
      coverLetter: coverLetter.trim(),
      expectedSalary: expectedSalary ? parseFloat(expectedSalary) : null,
      availableFrom: new Date(availableFrom),
      referenceEmail: referenceEmail || null,
      agreeToTerms: true,
      status: 'Applied'
    });

    // Increment application count
    job.applicationCount = (job.applicationCount || 0) + 1;
    await job.save();

    // Send notification to company
    try {
      const company = await Company.findById(job.companyId).populate('userId');
      if (company && company.userId) {
        await createNotification(
          company.userId._id,
          'Application',
          'New Application Received',
          `${profile.userId.name} applied for ${job.title}`,
          application._id,
          'Application'
        );
      }
    } catch (err) {
      console.error('Notification error:', err);
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Application error:', error);
    res.status(400).json({ 
      message: error.message || 'Failed to submit application' 
    });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const { status, search, sortBy = 'latest' } = req.query;
    
    console.log('Getting applications for user:', req.user._id);
    
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Build query
    let query = { studentId: profile._id };
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Fetch applications with populated data
    let applicationsQuery = Application.find(query)
      .populate({
        path: 'jobId',
        populate: { 
          path: 'companyId', 
          select: 'companyName industry location approved' 
        }
      });

    // Sorting
    if (sortBy === 'latest') {
      applicationsQuery = applicationsQuery.sort({ appliedAt: -1 });
    } else if (sortBy === 'oldest') {
      applicationsQuery = applicationsQuery.sort({ appliedAt: 1 });
    } else if (sortBy === 'status') {
      applicationsQuery = applicationsQuery.sort({ status: 1, appliedAt: -1 });
    }

    let applications = await applicationsQuery;

    // Search filter (client-side for now)
    if (search) {
      const searchLower = search.toLowerCase();
      applications = applications.filter(app => {
        if (!app.jobId) return false;
        return (
          app.jobId.title?.toLowerCase().includes(searchLower) ||
          app.jobId.companyId?.companyName?.toLowerCase().includes(searchLower) ||
          app.jobId.role?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filter out applications where job or company is deleted
    applications = applications.filter(app => app.jobId && app.jobId.companyId);

    console.log(`Found ${applications.length} applications`);

    res.json(applications);
  } catch (error) {
    console.error('Error getting applications:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getApplicationDetails = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    
    const application = await Application.findOne({
      _id: req.params.id,
      studentId: profile._id
    })
      .populate({
        path: 'jobId',
        populate: { path: 'companyId' }
      })
      .populate('updatedBy', 'name email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
