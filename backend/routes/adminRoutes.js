import express from 'express';
import {
  getAdminStats,
  getActivityLogs,
  getAdministrators,
  createAdministrator,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/logs', getActivityLogs);
router.route('/administrators').get(getAdministrators).post(createAdministrator);

export default router;

