import express from 'express';
import { getDashboardData, getOrganisationData } from '../controllers/dashboardController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/dashboard/:organisationId - Get dashboard analytics data
router.get('/',protect, getDashboardData);

// GET /api/dashboard/organisation - Get organisation information and user counts
router.get('/organisation', protect, getOrganisationData);

export default router;
