import { submitResponse, getResponsesBySurvey, getResponsesByOrganisation } from '../controllers/responseController.js';
import httpMocks from 'node-mocks-http';

// Mock the models
jest.mock('../models/Response.js');
jest.mock('../models/Survey.js');
jest.mock('../utils/sentimentAnalysis.js');

import Response from '../models/Response.js';
import Survey from '../models/Survey.js';
import { analyzeSentiment } from '../utils/sentimentAnalysis.js';

describe('ResponseController', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = httpMocks.createRequest();
    mockRes = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('submitResponse', () => {
    it('should return 400 if surveyId is missing', async () => {
      mockReq.body = {
        responses: [
          { questionId: 'q1', answer: 'Very satisfied' }
        ]
      };

      await submitResponse(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Survey ID and responses are required/);
    });

    it('should return 400 if responses are missing', async () => {
      mockReq.body = {
        surveyId: 'survey123'
        // Missing responses
      };

      await submitResponse(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Survey ID and responses are required/);
    });

    it('should return 400 if responses array is empty', async () => {
      mockReq.body = {
        surveyId: 'survey123',
        responses: []
      };

      await submitResponse(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Survey ID and responses are required/);
    });

    it('should submit response successfully with sentiment analysis', async () => {
      const mockSurvey = {
        _id: 'survey123',
        title: 'Customer Satisfaction Survey',
        questions: [
          { _id: 'q1', questionText: 'How satisfied are you?' }
        ]
      };

      const mockResponse = {
        _id: 'response123',
        surveyId: 'survey123',
        responses: [
          {
            questionId: 'q1',
            answer: 'Very satisfied',
            sentiment: 'positive'
          }
        ]
      };

      Survey.findById = jest.fn().mockResolvedValue(mockSurvey);
      analyzeSentiment.mockResolvedValue({ label: 'POSITIVE', score: 0.95 });
      Response.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockResponse)
      }));

      mockReq.body = {
        surveyId: 'survey123',
        responses: [
          { questionId: 'q1', answer: 'Very satisfied' }
        ]
      };

      await submitResponse(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(201);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().data.response._id).toBe('response123');
      expect(analyzeSentiment).toHaveBeenCalledWith('Very satisfied');
    });

    it('should handle survey not found', async () => {
      Survey.findById = jest.fn().mockResolvedValue(null);

      mockReq.body = {
        surveyId: 'nonexistent',
        responses: [
          { questionId: 'q1', answer: 'Very satisfied' }
        ]
      };

      await submitResponse(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(404);
      expect(mockRes._getJSONData().status).toBe('fail');
      expect(mockRes._getJSONData().message).toMatch(/Survey not found/);
    });

    it('should handle sentiment analysis errors gracefully', async () => {
      const mockSurvey = {
        _id: 'survey123',
        title: 'Customer Satisfaction Survey',
        questions: [
          { _id: 'q1', questionText: 'How satisfied are you?' }
        ]
      };

      Survey.findById = jest.fn().mockResolvedValue(mockSurvey);
      analyzeSentiment.mockRejectedValue(new Error('Sentiment analysis failed'));
      Response.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({
          _id: 'response123',
          surveyId: 'survey123',
          responses: [
            {
              questionId: 'q1',
              answer: 'Very satisfied',
              sentiment: 'neutral' // Default sentiment
            }
          ]
        })
      }));

      mockReq.body = {
        surveyId: 'survey123',
        responses: [
          { questionId: 'q1', answer: 'Very satisfied' }
        ]
      };

      await submitResponse(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(201);
      expect(mockRes._getJSONData().status).toBe('success');
      // Should still succeed even if sentiment analysis fails
    });

    it('should handle database errors', async () => {
      const mockSurvey = {
        _id: 'survey123',
        title: 'Customer Satisfaction Survey',
        questions: [
          { _id: 'q1', questionText: 'How satisfied are you?' }
        ]
      };

      Survey.findById = jest.fn().mockResolvedValue(mockSurvey);
      analyzeSentiment.mockResolvedValue({ label: 'POSITIVE', score: 0.95 });
      Response.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      }));

      mockReq.body = {
        surveyId: 'survey123',
        responses: [
          { questionId: 'q1', answer: 'Very satisfied' }
        ]
      };

      await submitResponse(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes._getJSONData().status).toBe('fail');
      expect(mockRes._getJSONData().message).toMatch(/Failed to submit response/);
    });
  });

  describe('getResponsesBySurvey', () => {
    it('should return 400 if surveyId is missing', async () => {
      mockReq.params = {};

      await getResponsesBySurvey(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Survey ID is required/);
    });

    it('should return responses successfully', async () => {
      const mockResponses = [
        {
          _id: 'response123',
          surveyId: 'survey123',
          responses: [
            {
              questionId: 'q1',
              answer: 'Very satisfied',
              sentiment: 'positive',
              questionText: 'How satisfied are you?',
              options: []
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      Response.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockResponses)
      });

      mockReq.params = { surveyId: 'survey123' };

      await getResponsesBySurvey(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().data).toHaveLength(1);
    });

    it('should return 404 if no responses found', async () => {
      Response.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      mockReq.params = { surveyId: 'survey123' };

      await getResponsesBySurvey(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(404);
      expect(mockRes._getJSONData().status).toBe('fail');
      expect(mockRes._getJSONData().message).toMatch(/No responses found for this survey/);
    });

    it('should handle database errors', async () => {
      Response.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      mockReq.params = { surveyId: 'survey123' };

      await getResponsesBySurvey(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes._getJSONData().status).toBe('fail');
    });
  });

  describe('getResponsesByOrganisation', () => {
    it('should return 400 if organisationId is missing', async () => {
      mockReq.user = {};

      await getResponsesByOrganisation(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Organisation ID is required/);
    });

    it('should return responses successfully', async () => {
      const mockResponses = [
        {
          _id: 'response123',
          organisationId: 'org123',
          message: 'Great product!',
          category: 'product',
          sentiment: 'positive',
          createdAt: new Date()
        }
      ];

      Response.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockResponses)
          })
        })
      });

      mockReq.user = { organisationId: 'org123' };

      await getResponsesByOrganisation(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().data).toHaveLength(1);
    });

    it('should return 404 if no responses found', async () => {
      Response.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([])
          })
        })
      });

      mockReq.user = { organisationId: 'org123' };

      await getResponsesByOrganisation(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(404);
      expect(mockRes._getJSONData().status).toBe('fail');
      expect(mockRes._getJSONData().message).toMatch(/No responses found for this organisation/);
    });

    it('should handle database errors', async () => {
      Response.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockRejectedValue(new Error('Database error'))
          })
        })
      });

      mockReq.user = { organisationId: 'org123' };

      await getResponsesByOrganisation(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes._getJSONData().status).toBe('fail');
    });
  });

  // Model validation tests
  describe('Response Model', () => {
    it('should require surveyId and responses', async () => {
      const response = new Response({});
      let err;
      try {
        await response.validate();
      } catch (error) {
        err = error;
      }
      expect(err).toBeDefined();
      expect(err.errors.surveyId).toBeDefined();
      expect(err.errors.responses).toBeDefined();
    });

    it('should require at least one response', async () => {
      const response = new Response({
        surveyId: 'survey123',
        responses: []
      });
      let err;
      try {
        await response.validate();
      } catch (error) {
        err = error;
      }
      expect(err).toBeDefined();
      expect(err.errors.responses).toBeDefined();
    });

    it('should validate response structure', async () => {
      const response = new Response({
        surveyId: 'survey123',
        responses: [
          {
            // Missing questionId and answer
          }
        ]
      });
      let err;
      try {
        await response.validate();
      } catch (error) {
        err = error;
      }
      expect(err).toBeDefined();
    });
  });
});
