import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getProfile,
  updateProfile,
  uploadResume,
  getEligibleJobs,
  applyJob,
  getMyApplications,
  getApplicationDetails
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

router.use(protect, authorize('student'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/upload-resume', upload.single('resume'), uploadResume);
router.get('/jobs', getEligibleJobs);
router.post('/apply/:jobId', applyJob);
router.get('/applications', getMyApplications);
router.get('/application/:id', getApplicationDetails);

export default router;
