import express from 'express';
import { 
    getSurveyReports, 
    getResponseReports, 
    getFeedbackReports, 
    getUserActivityReports, 
    getExecutiveSummary 
} from '../controllers/reportsController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { 
    surveyReportsSchema, 
    responseReportsSchema, 
    feedbackReportsSchema, 
    userActivityReportsSchema, 
    executiveSummarySchema 
} from '../schemas/reportsSchema.js';

const router = express.Router();

/**
 * @route   GET /api/reports/surveys
 * @desc    Get comprehensive survey reports
 * @access  Private (Admin, Analyst)
 * @query   startDate, endDate, surveyId
 */
router.get('/surveys', 
    protect, 
    restrictTo('admin', 'analyst'), 
    validate(surveyReportsSchema, 'query'), 
    getSurveyReports
);

/**
 * @route   GET /api/reports/responses
 * @desc    Get response analytics reports
 * @access  Private (Admin, Analyst)
 * @query   startDate, endDate, surveyId
 */
router.get('/responses', 
    protect, 
    restrictTo('admin', 'analyst'), 
    validate(responseReportsSchema, 'query'), 
    getResponseReports
);

/**
 * @route   GET /api/reports/feedback
 * @desc    Get feedback analytics reports
 * @access  Private (Admin, Analyst)
 * @query   startDate, endDate, category
 */
router.get('/feedback', 
    protect, 
    restrictTo('admin', 'analyst'), 
    validate(feedbackReportsSchema, 'query'), 
    getFeedbackReports
);

/**
 * @route   GET /api/reports/users
 * @desc    Get user activity reports
 * @access  Private (Admin only)
 * @query   startDate, endDate, role
 */
router.get('/users', 
    protect, 
    restrictTo('admin'), 
    validate(userActivityReportsSchema, 'query'), 
    getUserActivityReports
);

/**
 * @route   GET /api/reports/executive-summary
 * @desc    Get executive summary report
 * @access  Private (Admin only)
 * @query   period
 */
router.get('/executive-summary', 
    protect, 
    restrictTo('admin'), 
    validate(executiveSummarySchema, 'query'), 
    getExecutiveSummary
);

/**
 * @route   GET /api/reports/health
 * @desc    Health check for reports service
 * @access  Public
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Reports service is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

export default router;
