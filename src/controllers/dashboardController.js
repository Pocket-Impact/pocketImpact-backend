import mongoose from 'mongoose';
import Survey from '../models/Survey.js';
import Response from '../models/Response.js';
import Feedback from '../models/Feedback.js';
import Organisation from '../models/Organisation.js';
import User from '../models/User.js';

export const getDashboardData = async (req, res) => {
    try {
        const organisationId = req.user.organisationId;
        
        if (!organisationId) {
            return res.status(400).json({
                status: 'error',
                message: 'Organisation ID is required',
                timestamp: new Date().toISOString()
            });
        }

        // Get total counts
        const [totalSurveys, totalResponses, totalFeedbacks] = await Promise.all([
            Survey.countDocuments({ organisationId }),
            Response.countDocuments({ organisationId }),
            Feedback.countDocuments({ organisationId })
        ]);

        // Get daily feedback data for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const dailyFeedbacks = await Feedback.aggregate([
            {
                $match: {
                    organisationId: new mongoose.Types.ObjectId(organisationId),
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dayOfWeek: "$createdAt"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Format daily feedback data - MongoDB returns 1=Sunday, 2=Monday, etc.
        const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const formattedDailyFeedbacks = dayOrder.map((day, index) => {
            const found = dailyFeedbacks.find(item => item._id === index + 1);
            return {
                day: day,
                Feedbacks: found ? found.count : 0
            };
        });

        // Get sentiment analysis
        const sentimentData = await Feedback.aggregate([
            {
                $match: {
                    organisationId: new mongoose.Types.ObjectId(organisationId),
                    sentiment: { $ne: null }
                }
            },
            {
                $group: {
                    _id: "$sentiment",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format sentiment data with colors
        const sentimentColors = {
            positive: '#47b89b',
            negative: '#d25871',
            neutral: '#EFB100'
        };

        const chartData = sentimentData.map(item => ({
            name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
            value: item.count,
            color: sentimentColors[item._id]
        }));

        // Get top topics (categories)
        const topTopics = await Feedback.aggregate([
            {
                $match: {
                    organisationId: new mongoose.Types.ObjectId(organisationId)
                }
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 6
            }
        ]);

        // Format top topics with percentages
        const totalFeedbackCount = totalFeedbacks;
        const formattedTopTopics = topTopics.map(topic => ({
            category: topic._id.charAt(0).toUpperCase() + topic._id.slice(1),
            percentage: Math.round((topic.count / totalFeedbackCount) * 100)
        }));

        // Get recent feedbacks (last 6)
        const recentFeedbacks = await Feedback.find({
            organisationId: organisationId
        })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('message category sentiment createdAt')
        .lean();

        // Format recent feedbacks
        const formattedRecentFeedbacks = recentFeedbacks.map(feedback => ({
            message: feedback.message,
            category: feedback.category.charAt(0).toUpperCase() + feedback.category.slice(1),
            sentiment: feedback.sentiment ? feedback.sentiment.charAt(0).toUpperCase() + feedback.sentiment.slice(1) : 'Not Analyzed',
            date: feedback.createdAt
        }));

        res.json({
            status: 'success',
            message: 'Dashboard data retrieved successfully',
            timestamp: new Date().toISOString(),
            data: {
                totals: {
                    surveys: totalSurveys,
                    responses: totalResponses,
                    feedbacks: totalFeedbacks
                },
                dailyFeedbacks: formattedDailyFeedbacks,
                sentimentAnalysis: chartData,
                topTopics: formattedTopTopics,
                recentFeedbacks: formattedRecentFeedbacks
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch dashboard data',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

export const getOrganisationData = async (req, res) => {
    try {
        const organisationId = req.user.organisationId;
        
        if (!organisationId) {
            return res.status(400).json({
                status: 'error',
                message: 'Organisation ID is required'
            });
        }

        // Get organisation details
        const organisation = await Organisation.findById(organisationId);
        if (!organisation) {
            return res.status(404).json({
                status: 'error',
                message: 'Organisation not found'
            });
        }

        // Get user counts by role
        const userCounts = await User.aggregate([
            {
                $match: {
                    organisationId: new mongoose.Types.ObjectId(organisationId)
                }
            },
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Initialize counts
        let adminCount = 0;
        let analystCount = 0;
        let researcherCount = 0;

        // Map the counts to variables
        userCounts.forEach(item => {
            switch (item._id) {
                case 'admin':
                    adminCount = item.count;
                    break;
                case 'analyst':
                    analystCount = item.count;
                    break;
                case 'researcher':
                    researcherCount = item.count;
                    break;
            }
        });

        // Get total user count
        const totalUsers = adminCount + analystCount + researcherCount;

        res.json({
            status: 'success',
            message: 'Organisation data retrieved successfully',
            timestamp: new Date().toISOString(),
            data: {
                organisationName: organisation.organisationName,
                organisationCountry: organisation.organisationCountry,
                organisationSize: organisation.organisationSize,
                totalUsers: totalUsers,
                adminUsers: adminCount,
                analysts: analystCount,
                researchers: researcherCount
            }
        });

    } catch (error) {
        console.error('Organisation data error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch organisation data',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};
