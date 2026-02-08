import express from 'express';
import {
  getCompanyProfile,
  postJob,
  updateJob,
  closeJob,
  deleteJob,
  getCompanyJobs,
  getJobApplicants,
  updateApplicationStatus
} from '../controllers/companyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, authorize('company'));

router.get('/profile', getCompanyProfile);
router.post('/job', postJob);
router.put('/job/:id', updateJob);
router.patch('/job/:id/close', closeJob);
router.delete('/job/:id', deleteJob);
router.get('/jobs', getCompanyJobs);
router.get('/applicants/:jobId', getJobApplicants);
router.patch('/application/:id', updateApplicationStatus);

export default router;
