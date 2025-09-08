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

        // Get daily feedback data for the last 7 calendar days (by exact date)
        const nowDash = new Date();
        const sevenDaysAgoDash = new Date(nowDash.getTime() - 7 * 24 * 60 * 60 * 1000);

        const dailyFeedbacks = await Feedback.aggregate([
            {
                $match: {
                    organisationId: new mongoose.Types.ObjectId(organisationId),
                    createdAt: { $gte: sevenDaysAgoDash }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Build last 7 days series with correct day names
        const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const formattedDailyFeedbacks = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(nowDash.getTime() - i * 24 * 60 * 60 * 1000);
            const dateKey = d.toISOString().split('T')[0];
            const found = dailyFeedbacks.find(item => item._id === dateKey);
            formattedDailyFeedbacks.push({
                day: dayOrder[d.getDay()],
                Feedbacks: found ? found.count : 0
            });
        }

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
/* 
info to return
{
  "status": "success",
  "data": {
    "totals": {
      "surveys": Number,
      "feedbacks": Number,
      "responses": Number
    },
    "overviewCards": [
      {
        "title": String,
        "value": Number,
        "increase": Number // e.g. percentage or count change
      }
    ],
    "dailyFeedbacks": [
      {
        "date": String, // ISO date
        "Feedbacks": Number,
        //ADD A NEW FIELD HERE THAT WILL HOLD THE PERCENTAGE OF THE FEEDBACKS GROWTH FROM THE PREVIOUS DAY
        "GrowthPercentage": Number
      }
    ],
    "sentiment": {
      "positive": Number,
      "neutral": Number,
      "negative": Number
    },
    "topTopics": [
      {
        "category": String,
        "count": Number, // percentage or count
        "feedbacks": Number // optional
      }
    ],
    "recentFeedbacks": [
      {
        "message": String,
        "date": String, // ISO date
        "sentiment": String // "positive", "neutral", "negative"
      }
    ]
  }
}

*/
export const getDailyCategoriesData = async (req, res) => {
    try {
        const organisationId = req.user.organisationId;
        
        if (!organisationId) {
            return res.status(400).json({
                status: 'error',
                message: 'Organisation ID is required',
                timestamp: new Date().toISOString()
            });
        }

        // Get feedbacks for the last 7 days grouped by day and category
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const dailyCategoriesData = await Feedback.aggregate([
            {
                $match: {
                    organisationId: new mongoose.Types.ObjectId(organisationId),
                    createdAt: { $gte: sevenDaysAgo },
                    category: { $ne: null }
                }
            },
            {
                $group: {
                    _id: {
                        dayOfWeek: { $dayOfWeek: "$createdAt" },
                        category: "$category"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.dayOfWeek": 1 }
            }
        ]);

        // Define day names (MongoDB returns 1=Sunday, 2=Monday, etc.)
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const categories = [
            "Product",
            "Ux",
            "Support",
            "Pricing",
            "Features",
            "Performance",
            "Other"
        ]
        
        // Initialize the result array with all days
        const result = [];
        
        // Process each day of the week (Monday to Sunday)
        for (let dayIndex = 1; dayIndex <= 7; dayIndex++) {
            const dayName = dayNames[dayIndex - 1];
            const dayData = { day: dayName };
            
            // Initialize all categories with 0
            categories.forEach(category => {
                dayData[category] = 0;
            });
            
            // Find data for this day
            const dayFeedbacks = dailyCategoriesData.filter(item => item._id.dayOfWeek === dayIndex);
            
            // Fill in the counts for each category
            dayFeedbacks.forEach(feedback => {
                const category = feedback._id.category.charAt(0).toUpperCase() + feedback._id.category.slice(1);
                if (categories.includes(category)) {
                    dayData[category] = feedback.count;
                }
            });
            
            result.push(dayData);
        }

        res.json({
            status: "success",
            data: result
        });

    } catch (error) {
        console.error('Daily categories data error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch daily categories data',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

export const analyticsData = async (req, res) => {

    try {
        const organisationId = req.user.organisationId;
        
        if (!organisationId) {
            return res.status(400).json({
                status: 'error',
                message: 'Organisation ID is required',
                timestamp: new Date().toISOString()
            });
        }

        // Get current totals
        const [totalSurveys, totalResponses, totalFeedbacks] = await Promise.all([
            Survey.countDocuments({ organisationId }),
            Response.countDocuments({ organisationId }),
            Feedback.countDocuments({ organisationId })
        ]);

        // Calculate previous period totals for growth comparison (last 30 days vs previous 30 days)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const [prevSurveys, prevResponses, prevFeedbacks] = await Promise.all([
            Survey.countDocuments({ 
                organisationId, 
                createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
            }),
            Response.countDocuments({ 
                organisationId, 
                createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
            }),
            Feedback.countDocuments({ 
                organisationId, 
                createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
            })
        ]);

        // Calculate growth percentages
        const calculateGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        // Day-over-day growth (yesterday -> today)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
        const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

        const [
            todaySurveys,
            yesterdaySurveys,
            todayResponses,
            yesterdayResponses
        ] = await Promise.all([
            Survey.countDocuments({ organisationId, createdAt: { $gte: startOfToday, $lt: startOfTomorrow } }),
            Survey.countDocuments({ organisationId, createdAt: { $gte: startOfYesterday, $lt: startOfToday } }),
            Response.countDocuments({ organisationId, createdAt: { $gte: startOfToday, $lt: startOfTomorrow } }),
            Response.countDocuments({ organisationId, createdAt: { $gte: startOfYesterday, $lt: startOfToday } })
        ]);

        const surveysGrowthDayOverDay = calculateGrowth(todaySurveys, yesterdaySurveys);
        const responsesGrowthDayOverDay = calculateGrowth(todayResponses, yesterdayResponses);

        // Create overview cards
        const overviewCards = [
            {
                title: "Total Surveys",
                value: totalSurveys,
                increase: calculateGrowth(totalSurveys, prevSurveys)
            },
            {
                title: "Total Responses",
                value: totalResponses,
                increase: calculateGrowth(totalResponses, prevResponses)
            },
            {
                title: "Total Feedbacks",
                value: totalFeedbacks,
                increase: calculateGrowth(totalFeedbacks, prevFeedbacks)
            }
        ];

        // Get daily feedbacks for the last 7 days
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
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
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    Feedbacks: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Fill in missing dates with 0 feedbacks and compute GrowthPercentage day-over-day
        const formattedDailyFeedbacks = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateString = date.toISOString().split('T')[0];
            const found = dailyFeedbacks.find(item => item._id === dateString);
            const currentCount = found ? found.Feedbacks : 0;
            const previousCount = formattedDailyFeedbacks.length > 0 ? formattedDailyFeedbacks[formattedDailyFeedbacks.length - 1].Feedbacks : 0;
            const growth = previousCount === 0 ? (currentCount > 0 ? 100 : 0) : Math.round(((currentCount - previousCount) / previousCount) * 100);
            formattedDailyFeedbacks.push({
                date: dateString,
                Feedbacks: currentCount,
                GrowthPercentage: growth
            });
        }

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

        // Format sentiment data
        const sentiment = {
            positive: 0,
            neutral: 0,
            negative: 0
        };

        sentimentData.forEach(item => {
            if (sentiment.hasOwnProperty(item._id)) {
                sentiment[item._id] = item.count;
            }
        });

        // Get top topics
        const topTopics = await Feedback.aggregate([
            {
                $match: {
                    organisationId: new mongoose.Types.ObjectId(organisationId),
                    category: { $ne: null }
                }
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                    feedbacks: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            }
        ]);

        const formattedTopTopics = topTopics.map(topic => ({
            category: topic._id.charAt(0).toUpperCase() + topic._id.slice(1),
            count: topic.count,
            percentage: Math.round((topic.count / totalFeedbacks) * 100),
            feedbacks: topic.feedbacks
        }));

        // Get recent feedbacks
        const recentFeedbacks = await Feedback.find({
            organisationId: organisationId
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('message sentiment createdAt')
        .lean();

        const formattedRecentFeedbacks = recentFeedbacks.map(feedback => ({
            message: feedback.message,
            date: feedback.createdAt.toISOString(),
            sentiment: feedback.sentiment || 'neutral'
        }));

        res.json({
            status: "success",
            data: {
                totals: {
                    surveys: totalSurveys,
                    surveysGrowthPercentage: surveysGrowthDayOverDay,
                    feedbacks: totalFeedbacks,
                    // keeping feedback growth available if needed later
                    // feedbacksGrowthPercentage: calculateGrowth(totalFeedbacks, prevFeedbacks),
                    responses: totalResponses
                    ,responsesGrowthPercentage: responsesGrowthDayOverDay
                },
                overviewCards,
                dailyFeedbacks: formattedDailyFeedbacks,
                sentiment,
                topTopics: formattedTopTopics,
                recentFeedbacks: formattedRecentFeedbacks
            }
        });

    } catch (error) {
        console.error('Analytics data error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch analytics data',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};