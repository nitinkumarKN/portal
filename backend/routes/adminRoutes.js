import express from 'express';
import {
  getDashboardStats,
  // Company Approvals
  getPendingCompanies,
  getCompanyDetails,
  approveCompany,
  rejectCompany,
  getAllCompanies,
  toggleCompanyStatus,
  // Job Approvals
  getPendingJobs,
  getJobDetails,
  approveJob,
  rejectJob,
  // Stats
  getApprovalStats,
  getAllStudents
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/approval-stats', getApprovalStats);

// Company Approvals
router.get('/companies/pending', getPendingCompanies);
router.get('/companies/all', getAllCompanies);
router.get('/company/:id', getCompanyDetails);
router.patch('/company/:id/approve', approveCompany);
router.patch('/company/:id/reject', rejectCompany);
router.patch('/company/:id/toggle-status', toggleCompanyStatus);

// Job Approvals
router.get('/jobs/pending', getPendingJobs);
router.get('/job/:id', getJobDetails);
router.patch('/job/:id/approve', approveJob);
router.patch('/job/:id/reject', rejectJob);

// Students
router.get('/students', getAllStudents);

// Debug route - remove in production
router.get('/debug/companies', async (req, res) => {
  try {
    const Company = mongoose.model('Company');
    const companies = await Company.find().select('companyName approved approvalStatus');
    res.json(companies);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
