import { submitFeedback, getFeedbackByOrganisation, deleteFeedback, analyzeUnprocessedFeedbacks } from '../controllers/feedbackController.js';
import httpMocks from 'node-mocks-http';

// Mock the models
jest.mock('../models/Feedback.js');
jest.mock('../utils/sentimentAnalysis.js');

import Feedback from '../models/Feedback.js';
import { analyzeSentiment } from '../utils/sentimentAnalysis.js';

describe('FeedbackController', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = httpMocks.createRequest();
    mockRes = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('submitFeedback', () => {
    it('should return 400 if organisationId is missing', async () => {
      mockReq.body = {
        message: 'Great product!',
        category: 'product'
      };

      await submitFeedback(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Organisation and message are required/);
    });

    it('should return 400 if message is missing', async () => {
      mockReq.body = {
        organisationId: 'org123',
        category: 'product'
      };

      await submitFeedback(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Organisation and message are required/);
    });

    it('should create feedback successfully', async () => {
      const mockFeedback = {
        _id: 'feedback123',
        organisationId: 'org123',
        message: 'Great product!',
        category: 'product',
        sentiment: null,
        createdAt: new Date()
      };

      Feedback.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockFeedback)
      }));

      mockReq.body = {
        organisationId: 'org123',
        message: 'Great product!',
        category: 'product'
      };

      await submitFeedback(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(201);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().data._id).toBe('feedback123');
    });

    it('should handle database errors', async () => {
      Feedback.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      }));

      mockReq.body = {
        organisationId: 'org123',
        message: 'Great product!',
        category: 'product'
      };

      await submitFeedback(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes._getJSONData().status).toBe('fail');
    });
  });

  describe('getFeedbackByOrganisation', () => {
    it('should return 400 if organisationId is missing', async () => {
      mockReq.user = {};

      await getFeedbackByOrganisation(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Organisation ID is required/);
    });

    it('should return feedback successfully', async () => {
      const mockFeedbacks = [
        {
          _id: 'feedback123',
          organisationId: 'org123',
          message: 'Great product!',
          category: 'product',
          sentiment: 'positive',
          createdAt: new Date()
        }
      ];

      Feedback.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockFeedbacks)
        })
      });

      mockReq.user = { organisationId: 'org123' };

      await getFeedbackByOrganisation(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().data).toHaveLength(1);
    });

    it('should handle database errors', async () => {
      Feedback.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      mockReq.user = { organisationId: 'org123' };

      await getFeedbackByOrganisation(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes._getJSONData().status).toBe('fail');
    });
  });

  describe('deleteFeedback', () => {
    it('should return 400 if feedbackId is missing', async () => {
      mockReq.params = {};

      await deleteFeedback(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Feedback ID is required/);
    });

    it('should delete feedback successfully', async () => {
      const mockFeedback = {
        _id: 'feedback123',
        organisationId: 'org123'
      };

      Feedback.findByIdAndDelete = jest.fn().mockResolvedValue(mockFeedback);

      mockReq.params = { id: 'feedback123' };
      mockReq.user = { organisationId: 'org123' };

      await deleteFeedback(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().message).toMatch(/Feedback deleted successfully/);
    });

    it('should return 404 if feedback not found', async () => {
      Feedback.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      mockReq.params = { id: 'nonexistent' };
      mockReq.user = { organisationId: 'org123' };

      await deleteFeedback(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(404);
      expect(mockRes._getJSONData().status).toBe('fail');
      expect(mockRes._getJSONData().message).toMatch(/Feedback not found/);
    });
  });

  describe('analyzeUnprocessedFeedbacks', () => {
    it('should analyze sentiment successfully', async () => {
      const mockFeedbacks = [
        {
          _id: 'feedback123',
          message: 'Great product!',
          sentiment: null
        }
      ];

      Feedback.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockFeedbacks)
      });

      Feedback.findByIdAndUpdate = jest.fn().mockResolvedValue({});

      mockReq.user = { organisationId: 'org123' };

      await analyzeUnprocessedFeedbacks(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().message).toMatch(/feedbacks analyzed successfully/);
    });

    it('should handle database errors', async () => {
      Feedback.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      mockReq.user = { organisationId: 'org123' };

      await analyzeUnprocessedFeedbacks(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes._getJSONData().message).toMatch(/Server error/);
    });
  });
});
