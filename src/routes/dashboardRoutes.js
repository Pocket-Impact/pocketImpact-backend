import express from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/dashboard/:organisationId - Get dashboard analytics data
router.get('/',protect, getDashboardData);

export default router;
