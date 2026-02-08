import express from 'express';
import {
  createPlacementDrive,
  getAllDrives,
  getDriveById,
  updateDrive,
  deleteDrive,
  getActiveDrives
} from '../controllers/placementDriveController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/active', getActiveDrives);

router.use(authorize('admin'));

router.route('/')
  .get(getAllDrives)
  .post(createPlacementDrive);

router.route('/:id')
  .get(getDriveById)
  .put(updateDrive)
  .delete(deleteDrive);

export default router;
