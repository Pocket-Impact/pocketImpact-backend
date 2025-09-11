import express from 'express';
import { getDailyCategoriesData, getDashboardData, getOrganisationData } from '../controllers/dashboardController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/dashboard/:organisationId - Get dashboard analytics data
router.get('/',protect, getDashboardData);

// GET /api/dashboard/organisation - Get organisation information and user counts
router.get('/organisation', protect, getOrganisationData);

// GET /api/dashboard/analytics - Get analytics data

// GET /api/dashboard/daily-categories - Get daily categories data
router.get('/daily-categories', protect, getDailyCategoriesData);

export default router;
