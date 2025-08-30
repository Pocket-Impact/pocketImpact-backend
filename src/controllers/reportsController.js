import mongoose from 'mongoose';
import Survey from '../models/Survey.js';
import Response from '../models/Response.js';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import { 
    createDateFilter, 
    createOrganisationFilter, 
    formatAggregationResults,
    calculatePercentage,
    createErrorResponse,
    createSuccessResponse
} from '../utils/databaseHelpers.js';
import { 
    SUCCESS_MESSAGES, 
    ERROR_MESSAGES, 
    ERROR_CODES,
    DEFAULTS,
    CHART_COLORS,
    SENTIMENT_TYPES,
    USER_ROLES_ARRAY
} from '../constants/reports.js';

/**
 * Get comprehensive survey reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getSurveyReports = async (req, res) => {
    try {
        const { startDate, endDate, surveyId } = req.query;
        const organisationId = req.user.organisationId;

        // Validate organisation ID
        if (!organisationId) {
            const { response, statusCode } = createErrorResponse(
                ERROR_MESSAGES.ORGANISATION_REQUIRED,
                400,
                ERROR_CODES.INVALID_ORGANISATION_ID
            );
            return res.status(statusCode).json(response);
        }

        // Create filters
        const organisationFilter = createOrganisationFilter(organisationId);
        const dateFilter = createDateFilter(startDate, endDate);
        
        let surveyFilter = { ...organisationFilter, ...dateFilter };
        if (surveyId) {
            const objectId = mongoose.Types.ObjectId.isValid(surveyId) 
                ? new mongoose.Types.ObjectId(surveyId) 
                : null;
            if (objectId) {
                surveyFilter._id = objectId;
            }
        }

        // Get survey statistics using aggregation pipeline
        const surveyStats = await Survey.aggregate([
            { $match: surveyFilter },
            {
                $group: {
                    _id: null,
                    totalSurveys: { $sum: 1 },
                    activeSurveys: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
                        }
                    },
                    avgQuestions: { $avg: { $size: '$questions' } },
                    totalQuestions: { $sum: { $size: '$questions' } }
                }
            }
        ]);

        // Get survey responses count
        const responseStats = await Response.aggregate([
            {
                $lookup: {
                    from: 'surveys',
                    localField: 'survey',
                    foreignField: '_id',
                    as: 'surveyInfo'
                }
            },
            {
                $match: {
                    'surveyInfo.organisationId': new mongoose.Types.ObjectId(organisationId)
                }
            },
            {
                $group: {
                    _id: '$survey',
                    responseCount: { $sum: 1 }
                }
            }
        ]);

        // Get top performing surveys
        const topSurveys = await Survey.aggregate([
            { $match: surveyFilter },
            {
                $lookup: {
                    from: 'responses',
                    localField: '_id',
                    foreignField: 'survey',
                    as: 'responses'
                }
            },
            {
                $addFields: {
                    responseCount: { $size: '$responses' },
                    completionRate: {
                        $cond: [
                            { $gt: [{ $size: '$questions' }, 0] },
                            {
                                $multiply: [
                                    { $divide: [{ $size: '$responses' }, { $size: '$questions' }] },
                                    100
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            { $sort: { responseCount: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    responseCount: 1,
                    completionRate: 1,
                    questionCount: { $size: '$questions' },
                    createdAt: 1
                }
            }
        ]);

        // Format the data
        const summary = surveyStats[0] || {
            totalSurveys: 0,
            activeSurveys: 0,
            avgQuestions: 0,
            totalQuestions: 0
        };

        const { response, statusCode } = createSuccessResponse(
            SUCCESS_MESSAGES.SURVEY_REPORTS,
            {
                summary: {
                    ...summary,
                    avgQuestions: Math.round(summary.avgQuestions * 100) / 100
                },
                topSurveys,
                responseStats: formatAggregationResults(responseStats, 'surveyId', 'responseCount')
            }
        );

        res.status(statusCode).json(response);

    } catch (error) {
        console.error('Error generating survey reports:', error);
        
        const { response, statusCode } = createErrorResponse(
            ERROR_MESSAGES.FAILED_TO_GENERATE,
            500,
            ERROR_CODES.DATABASE_ERROR
        );
        
        res.status(statusCode).json(response);
    }
};

/**
 * Get response analytics reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getResponseReports = async (req, res) => {
    try {
        const { startDate, endDate, surveyId } = req.query;
        const organisationId = req.user.organisationId;

        if (!organisationId) {
            const { response, statusCode } = createErrorResponse(
                ERROR_MESSAGES.ORGANISATION_REQUIRED,
                400,
                ERROR_CODES.INVALID_ORGANISATION_ID
            );
            return res.status(statusCode).json(response);
        }

        const organisationFilter = createOrganisationFilter(organisationId);
        const dateFilter = createDateFilter(startDate, endDate);

        // Get response trends over time
        const responseTrends = await Response.aggregate([
            {
                $lookup: {
                    from: 'surveys',
                    localField: 'survey',
                    foreignField: '_id',
                    as: 'surveyInfo'
                }
            },
            {
                $match: {
                    'surveyInfo.organisationId': new mongoose.Types.ObjectId(organisationId),
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get sentiment analysis for responses
        const sentimentAnalysis = await Response.aggregate([
            {
                $lookup: {
                    from: 'surveys',
                    localField: 'survey',
                    foreignField: '_id',
                    as: 'surveyInfo'
                }
            },
            {
                $match: {
                    'surveyInfo.organisationId': new mongoose.Types.ObjectId(organisationId),
                    ...dateFilter
                }
            },
            {
                $unwind: '$responses'
            },
            {
                $group: {
                    _id: '$responses.sentiment',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get completion rates
        const completionRates = await Survey.aggregate([
            { $match: { organisationId: new mongoose.Types.ObjectId(organisationId) } },
            {
                $lookup: {
                    from: 'responses',
                    localField: '_id',
                    foreignField: 'survey',
                    as: 'responses'
                }
            },
            {
                $addFields: {
                    responseCount: { $size: '$responses' },
                    completionRate: {
                        $cond: [
                            { $gt: [{ $size: '$questions' }, 0] },
                            {
                                $multiply: [
                                    { $divide: [{ $size: '$responses' }, { $size: '$questions' }] },
                                    100
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    responseCount: 1,
                    completionRate: { $round: ['$completionRate', 2] },
                    questionCount: { $size: '$questions' }
                }
            }
        ]);

        const { response, statusCode } = createSuccessResponse(
            SUCCESS_MESSAGES.RESPONSE_REPORTS,
            {
                responseTrends: formatAggregationResults(responseTrends, 'date', 'count'),
                sentimentAnalysis: formatAggregationResults(sentimentAnalysis, 'sentiment', 'count'),
                completionRates
            }
        );

        res.status(statusCode).json(response);

    } catch (error) {
        console.error('Error generating response reports:', error);
        
        const { response, statusCode } = createErrorResponse(
            ERROR_MESSAGES.FAILED_TO_GENERATE,
            500,
            ERROR_CODES.DATABASE_ERROR
        );
        
        res.status(statusCode).json(response);
    }
};

/**
 * Get feedback analytics reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getFeedbackReports = async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;
        const organisationId = req.user.organisationId;

        if (!organisationId) {
            const { response, statusCode } = createErrorResponse(
                ERROR_MESSAGES.ORGANISATION_REQUIRED,
                400,
                ERROR_CODES.INVALID_ORGANISATION_ID
            );
            return res.status(statusCode).json(response);
        }

        const organisationFilter = createOrganisationFilter(organisationId);
        const dateFilter = createDateFilter(startDate, endDate);
        
        let categoryFilter = {};
        if (category && SENTIMENT_TYPES[category.toUpperCase()]) {
            categoryFilter.category = category.toLowerCase();
        }

        // Get feedback trends
        const feedbackTrends = await Feedback.aggregate([
            {
                $match: {
                    ...organisationFilter,
                    ...dateFilter,
                    ...categoryFilter
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get category distribution
        const categoryDistribution = await Feedback.aggregate([
            {
                $match: {
                    ...organisationFilter,
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get sentiment trends
        const sentimentTrends = await Feedback.aggregate([
            {
                $match: {
                    ...organisationFilter,
                    sentiment: { $ne: null },
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        sentiment: '$sentiment'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.date': 1 } }
        ]);

        // Calculate total feedback count for percentages
        const totalFeedbackCount = categoryDistribution.reduce((sum, item) => sum + item.count, 0);

        // Format category distribution with percentages
        const formattedCategoryDistribution = categoryDistribution.map(item => ({
            category: item._id.charAt(0).toUpperCase() + item._id.slice(1),
            count: item.count,
            percentage: calculatePercentage(item.count, totalFeedbackCount)
        }));

        const { response, statusCode } = createSuccessResponse(
            SUCCESS_MESSAGES.FEEDBACK_REPORTS,
            {
                feedbackTrends: formatAggregationResults(feedbackTrends, 'date', 'count'),
                categoryDistribution: formattedCategoryDistribution,
                sentimentTrends,
                totalFeedbackCount
            }
        );

        res.status(statusCode).json(response);

    } catch (error) {
        console.error('Error generating feedback reports:', error);
        
        const { response, statusCode } = createErrorResponse(
            ERROR_MESSAGES.FAILED_TO_GENERATE,
            500,
            ERROR_CODES.DATABASE_ERROR
        );
        
        res.status(statusCode).json(response);
    }
};

/**
 * Get user activity reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserActivityReports = async (req, res) => {
    try {
        const { startDate, endDate, role } = req.query;
        const organisationId = req.user.organisationId;

        if (!organisationId) {
            const { response, statusCode } = createErrorResponse(
                ERROR_MESSAGES.ORGANISATION_REQUIRED,
                400,
                ERROR_CODES.INVALID_ORGANISATION_ID
            );
            return res.status(statusCode).json(response);
        }

        const organisationFilter = createOrganisationFilter(organisationId);
        const dateFilter = createDateFilter(startDate, endDate);
        
        let roleFilter = {};
        if (role && USER_ROLES_ARRAY.includes(role.toLowerCase())) {
            roleFilter.role = role.toLowerCase();
        }

        // Get user statistics
        const userStats = await User.aggregate([
            {
                $match: {
                    ...organisationFilter,
                    ...dateFilter,
                    ...roleFilter
                }
            },
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    verifiedUsers: {
                        $sum: { $cond: ['$isVerified', 1, 0] }
                    },
                    activeUsers: {
                        $sum: {
                            $cond: [
                                { $gte: ['$lastLoginAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // Get role distribution
        const roleDistribution = await User.aggregate([
            {
                $match: organisationFilter
            },
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get user activity over time
        const userActivity = await User.aggregate([
            {
                $match: {
                    ...organisationFilter,
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    newUsers: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const stats = userStats[0] || {
            totalUsers: 0,
            verifiedUsers: 0,
            activeUsers: 0
        };

        const { response, statusCode } = createSuccessResponse(
            SUCCESS_MESSAGES.USER_REPORTS,
            {
                userStats: {
                    ...stats,
                    verificationRate: calculatePercentage(stats.verifiedUsers, stats.totalUsers),
                    activityRate: calculatePercentage(stats.activeUsers, stats.totalUsers)
                },
                roleDistribution: formatAggregationResults(roleDistribution, 'role', 'count'),
                userActivity: formatAggregationResults(userActivity, 'date', 'newUsers')
            }
        );

        res.status(statusCode).json(response);

    } catch (error) {
        console.error('Error generating user activity reports:', error);
        
        const { response, statusCode } = createErrorResponse(
            ERROR_MESSAGES.FAILED_TO_GENERATE,
            500,
            ERROR_CODES.DATABASE_ERROR
        );
        
        res.status(statusCode).json(response);
    }
};

/**
 * Get comprehensive executive summary report
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getExecutiveSummary = async (req, res) => {
    try {
        const { period = DEFAULTS.PERIOD_DAYS } = req.query;
        const organisationId = req.user.organisationId;

        if (!organisationId) {
            const { response, statusCode } = createErrorResponse(
                ERROR_MESSAGES.ORGANISATION_REQUIRED,
                400,
                ERROR_CODES.INVALID_ORGANISATION_ID
            );
            return res.status(statusCode).json(response);
        }

        // Validate period
        const periodDays = Math.min(
            Math.max(parseInt(period) || DEFAULTS.PERIOD_DAYS, DEFAULTS.MIN_PERIOD_DAYS),
            DEFAULTS.MAX_PERIOD_DAYS
        );

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);

        const organisationFilter = createOrganisationFilter(organisationId);
        const dateFilter = { createdAt: { $gte: startDate } };

        // Get key metrics using Promise.all for better performance
        const [totalSurveys, totalResponses, totalFeedbacks, totalUsers] = await Promise.all([
            Survey.countDocuments({ ...organisationFilter, ...dateFilter }),
            Response.countDocuments({ ...organisationFilter, ...dateFilter }),
            Feedback.countDocuments({ ...organisationFilter, ...dateFilter }),
            User.countDocuments({ ...organisationFilter, ...dateFilter })
        ]);

        // Get sentiment overview
        const sentimentOverview = await Feedback.aggregate([
            {
                $match: {
                    ...organisationFilter,
                    sentiment: { $ne: null },
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: '$sentiment',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get top feedback categories
        const topCategories = await Feedback.aggregate([
            {
                $match: {
                    ...organisationFilter,
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Calculate response rate
        const avgResponseRate = totalSurveys > 0 ? (totalResponses / totalSurveys) * 100 : 0;

        // Generate recommendations
        const recommendations = generateRecommendations({
            totalSurveys,
            totalResponses,
            totalFeedbacks,
            avgResponseRate,
            sentimentOverview
        });

        const { response, statusCode } = createSuccessResponse(
            SUCCESS_MESSAGES.EXECUTIVE_SUMMARY,
            {
                period: `${periodDays} days`,
                keyMetrics: {
                    totalSurveys,
                    totalResponses,
                    totalFeedbacks,
                    totalUsers,
                    avgResponseRate: Math.round(avgResponseRate * 100) / 100
                },
                sentimentOverview: formatAggregationResults(sentimentOverview, 'sentiment', 'count'),
                topCategories: formatAggregationResults(topCategories, 'category', 'count'),
                recommendations
            }
        );

        res.status(statusCode).json(response);

    } catch (error) {
        console.error('Error generating executive summary:', error);
        
        const { response, statusCode } = createErrorResponse(
            ERROR_MESSAGES.FAILED_TO_GENERATE,
            500,
            ERROR_CODES.DATABASE_ERROR
        );
        
        res.status(statusCode).json(response);
    }
};

/**
 * Generate actionable recommendations based on metrics
 * @param {Object} metrics - Key performance metrics
 * @returns {Array} - Array of recommendation strings
 */
const generateRecommendations = (metrics) => {
    const recommendations = [];

    if (metrics.avgResponseRate < 20) {
        recommendations.push('Consider improving survey engagement strategies to increase response rates');
    }

    if (metrics.totalFeedbacks < 10) {
        recommendations.push('Encourage more feedback collection to better understand user needs');
    }

    const positiveSentiment = metrics.sentimentOverview.find(s => s._id === 'positive')?.count || 0;
    const negativeSentiment = metrics.sentimentOverview.find(s => s._id === 'negative')?.count || 0;
    
    if (negativeSentiment > positiveSentiment) {
        recommendations.push('Focus on addressing negative feedback to improve overall satisfaction');
    }

    if (metrics.totalSurveys < 5) {
        recommendations.push('Consider creating more surveys to gather comprehensive feedback');
    }

    if (metrics.totalUsers < 10) {
        recommendations.push('Focus on user acquisition and team building within the organisation');
    }

    return recommendations;
};
