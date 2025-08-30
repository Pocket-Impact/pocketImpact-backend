import mongoose from 'mongoose';
import { jest } from '@jest/globals';

// Mock the models
jest.mock('../models/Survey.js');
jest.mock('../models/Response.js');
jest.mock('../models/Feedback.js');
jest.mock('../models/User.js');

import Survey from '../models/Survey.js';
import Response from '../models/Response.js';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';

import {
    getSurveyReports,
    getResponseReports,
    getFeedbackReports,
    getUserActivityReports,
    getExecutiveSummary
} from '../controllers/reportsController.js';

describe('Reports Controller', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        mockReq = {
            user: {
                organisationId: '507f1f77bcf86cd799439011'
            },
            query: {}
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Clear all mocks
        jest.clearAllMocks();
    });

    describe('getSurveyReports', () => {
        it('should return survey reports successfully', async () => {
            const mockSurveyStats = [{
                totalSurveys: 10,
                activeSurveys: 8,
                avgQuestions: 5.5,
                totalQuestions: 55
            }];

            const mockTopSurveys = [
                {
                    _id: 'survey1',
                    title: 'Test Survey 1',
                    responseCount: 25,
                    completionRate: 80
                }
            ];

            Survey.aggregate.mockResolvedValue(mockSurveyStats);
            Response.aggregate.mockResolvedValue([]);
            Survey.aggregate.mockResolvedValueOnce(mockSurveyStats);
            Survey.aggregate.mockResolvedValueOnce(mockTopSurveys);

            await getSurveyReports(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'success',
                    message: expect.any(String),
                    data: expect.objectContaining({
                        summary: expect.any(Object),
                        topSurveys: expect.any(Array)
                    })
                })
            );
        });

        it('should handle missing organisation ID', async () => {
            mockReq.user.organisationId = null;

            await getSurveyReports(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'error',
                    message: expect.stringContaining('Organisation ID is required')
                })
            );
        });

        it('should handle database errors', async () => {
            Survey.aggregate.mockRejectedValue(new Error('Database error'));

            await getSurveyReports(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'error',
                    message: expect.stringContaining('Failed to generate')
                })
            );
        });
    });

    describe('getResponseReports', () => {
        it('should return response reports successfully', async () => {
            const mockResponseTrends = [
                { _id: '2024-01-01', count: 10 },
                { _id: '2024-01-02', count: 15 }
            ];

            Response.aggregate.mockResolvedValue(mockResponseTrends);
            Survey.aggregate.mockResolvedValue([]);

            await getResponseReports(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'success',
                    data: expect.objectContaining({
                        responseTrends: expect.any(Array)
                    })
                })
            );
        });

        it('should handle missing organisation ID', async () => {
            mockReq.user.organisationId = null;

            await getResponseReports(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });

    describe('getFeedbackReports', () => {
        it('should return feedback reports successfully', async () => {
            const mockFeedbackTrends = [
                { _id: '2024-01-01', count: 5 },
                { _id: '2024-01-02', count: 8 }
            ];

            const mockCategoryDistribution = [
                { _id: 'product', count: 10 },
                { _id: 'support', count: 5 }
            ];

            Feedback.aggregate
                .mockResolvedValueOnce(mockFeedbackTrends)
                .mockResolvedValueOnce(mockCategoryDistribution)
                .mockResolvedValueOnce([]);

            await getFeedbackReports(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'success',
                    data: expect.objectContaining({
                        feedbackTrends: expect.any(Array),
                        categoryDistribution: expect.any(Array)
                    })
                })
            );
        });

        it('should filter by category when provided', async () => {
            mockReq.query.category = 'product';

            Feedback.aggregate.mockResolvedValue([]);

            await getFeedbackReports(mockReq, mockRes);

            expect(Feedback.aggregate).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        $match: expect.objectContaining({
                            category: 'product'
                        })
                    })
                ])
            );
        });
    });

    describe('getUserActivityReports', () => {
        it('should return user activity reports successfully', async () => {
            const mockUserStats = [{
                totalUsers: 25,
                verifiedUsers: 23,
                activeUsers: 18
            }];

            const mockRoleDistribution = [
                { _id: 'admin', count: 5 },
                { _id: 'analyst', count: 12 }
            ];

            User.aggregate
                .mockResolvedValueOnce(mockUserStats)
                .mockResolvedValueOnce(mockRoleDistribution)
                .mockResolvedValueOnce([]);

            await getUserActivityReports(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'success',
                    data: expect.objectContaining({
                        userStats: expect.any(Object),
                        roleDistribution: expect.any(Array)
                    })
                })
            );
        });

        it('should filter by role when provided', async () => {
            mockReq.query.role = 'admin';

            User.aggregate.mockResolvedValue([]);

            await getUserActivityReports(mockReq, mockRes);

            expect(User.aggregate).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        $match: expect.objectContaining({
                            role: 'admin'
                        })
                    })
                ])
            );
        });
    });

    describe('getExecutiveSummary', () => {
        it('should return executive summary successfully', async () => {
            const mockSentimentOverview = [
                { _id: 'positive', count: 15 },
                { _id: 'negative', count: 5 }
            ];

            const mockTopCategories = [
                { _id: 'product', count: 8 },
                { _id: 'support', count: 6 }
            ];

            Survey.countDocuments.mockResolvedValue(15);
            Response.countDocuments.mockResolvedValue(89);
            Feedback.countDocuments.mockResolvedValue(23);
            User.countDocuments.mockResolvedValue(25);
            Feedback.aggregate
                .mockResolvedValueOnce(mockSentimentOverview)
                .mockResolvedValueOnce(mockTopCategories);

            await getExecutiveSummary(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'success',
                    data: expect.objectContaining({
                        keyMetrics: expect.any(Object),
                        recommendations: expect.any(Array)
                    })
                })
            );
        });

        it('should use default period when not provided', async () => {
            Survey.countDocuments.mockResolvedValue(0);
            Response.countDocuments.mockResolvedValue(0);
            Feedback.countDocuments.mockResolvedValue(0);
            User.countDocuments.mockResolvedValue(0);
            Feedback.aggregate.mockResolvedValue([]);

            await getExecutiveSummary(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('should validate period limits', async () => {
            mockReq.query.period = '400'; // Exceeds max

            Survey.countDocuments.mockResolvedValue(0);
            Response.countDocuments.mockResolvedValue(0);
            Feedback.countDocuments.mockResolvedValue(0);
            User.countDocuments.mockResolvedValue(0);
            Feedback.aggregate.mockResolvedValue([]);

            await getExecutiveSummary(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe('Error Handling', () => {
        it('should handle database connection errors', async () => {
            Survey.aggregate.mockRejectedValue(new Error('Connection failed'));

            await getSurveyReports(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'error',
                    message: expect.stringContaining('Failed to generate')
                })
            );
        });

        it('should handle invalid ObjectId errors', async () => {
            mockReq.query.surveyId = 'invalid-id';

            Survey.aggregate.mockResolvedValue([]);
            Response.aggregate.mockResolvedValue([]);

            await getSurveyReports(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe('Input Validation', () => {
        it('should handle date range filters correctly', async () => {
            mockReq.query.startDate = '2024-01-01';
            mockReq.query.endDate = '2024-01-31';

            Survey.aggregate.mockResolvedValue([]);
            Response.aggregate.mockResolvedValue([]);
            Survey.aggregate.mockResolvedValueOnce([]);

            await getSurveyReports(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('should handle empty query parameters', async () => {
            Survey.aggregate.mockResolvedValue([]);
            Response.aggregate.mockResolvedValue([]);
            Survey.aggregate.mockResolvedValueOnce([]);

            await getSurveyReports(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
});
