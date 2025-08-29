import { createSurvey, getSurveysByOrganisation, sendEmailsWithSurveyLink } from '../controllers/SurveyController.js';
import httpMocks from 'node-mocks-http';

// Mock the models
jest.mock('../models/Survey.js');
jest.mock('../models/User.js');
jest.mock('../utils/sendEmail.js');
jest.mock('crypto');

import Survey from '../models/Survey.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';
import crypto from 'crypto';

describe('SurveyController', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = httpMocks.createRequest();
    mockRes = httpMocks.createResponse();
    jest.clearAllMocks();
    
    // Mock crypto.randomBytes
    crypto.randomBytes = jest.fn().mockReturnValue({ toString: () => 'abc123' });
  });

  describe('createSurvey', () => {
    it('should return 400 if title is missing', async () => {
      mockReq.body = {
        description: 'Monthly survey',
        questions: [
          { questionText: 'How satisfied are you?', type: 'rating' }
        ]
      };

      await createSurvey(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Title, questions, organisation, and createdBy are required/);
    });

    it('should return 400 if questions are missing', async () => {
      mockReq.body = {
        title: 'Customer Satisfaction Survey',
        description: 'Monthly survey'
        // Missing questions
      };

      await createSurvey(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Title, questions, organisation, and createdBy are required/);
    });

    it('should return 400 if questions array is empty', async () => {
      mockReq.body = {
        title: 'Customer Satisfaction Survey',
        description: 'Monthly survey',
        questions: []
      };

      await createSurvey(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Title, questions, organisation, and createdBy are required/);
    });

    it('should create survey successfully', async () => {
      const mockSurvey = {
        _id: 'survey123',
        title: 'Customer Satisfaction Survey',
        description: 'Monthly survey',
        questions: [
          { questionText: 'How satisfied are you?', type: 'rating' }
        ],
        uniqueLinkId: 'abc123',
        organisationId: 'org123',
        createdBy: 'user123'
      };

      Survey.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSurvey)
      }));

      mockReq.body = {
        title: 'Customer Satisfaction Survey',
        description: 'Monthly survey',
        questions: [
          { questionText: 'How satisfied are you?', type: 'rating' }
        ]
      };
      mockReq.user = { 
        id: 'user123',
        organisationId: 'org123'
      };

      await createSurvey(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(201);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().data.survey.title).toBe('Customer Satisfaction Survey');
    });

    it('should handle database errors', async () => {
      Survey.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      }));

      mockReq.body = {
        title: 'Customer Satisfaction Survey',
        description: 'Monthly survey',
        questions: [
          { questionText: 'How satisfied are you?', type: 'rating' }
        ]
      };
      mockReq.user = { 
        id: 'user123',
        organisationId: 'org123'
      };

      await createSurvey(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes._getJSONData().message).toMatch(/Could not create survey/);
    });
  });

  describe('getSurveysByOrganisation', () => {
    it('should return 400 if organisationId is missing', async () => {
      mockReq.user = {};

      await getSurveysByOrganisation(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Organisation ID is required/);
    });

    it('should return surveys successfully', async () => {
      const mockSurveys = [
        {
          _id: 'survey123',
          title: 'Customer Satisfaction Survey',
          description: 'Monthly survey',
          questions: [
            { questionText: 'How satisfied are you?', type: 'rating' }
          ]
        }
      ];

      Survey.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSurveys)
      });

      mockReq.user = { organisationId: 'org123' };

      await getSurveysByOrganisation(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().data).toHaveLength(1);
    });

    it('should handle database errors', async () => {
      Survey.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      mockReq.user = { organisationId: 'org123' };

      await getSurveysByOrganisation(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes._getJSONData().message).toMatch(/Could not fetch surveys/);
    });
  });

  describe('sendEmailsWithSurveyLink', () => {
    it('should return 400 if surveyId is missing', async () => {
      mockReq.body = {
        emails: ['user1@example.com', 'user2@example.com']
      };

      await sendEmailsWithSurveyLink(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/surveyId and emails are required/);
    });

    it('should return 400 if emails are missing', async () => {
      mockReq.body = {
        surveyId: 'survey123'
        // Missing emails
      };

      await sendEmailsWithSurveyLink(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/surveyId and emails are required/);
    });

    it('should return 400 if emails array is empty', async () => {
      mockReq.body = {
        surveyId: 'survey123',
        emails: []
      };

      await sendEmailsWithSurveyLink(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/surveyId and emails are required/);
    });

    it('should send survey links successfully', async () => {
      const mockSurvey = {
        _id: 'survey123',
        title: 'Customer Satisfaction Survey',
        uniqueLinkId: 'abc123'
      };

      Survey.findOne = jest.fn().mockResolvedValue(mockSurvey);
      sendEmail.mockResolvedValue();

      mockReq.body = {
        surveyId: 'survey123',
        emails: ['user1@example.com', 'user2@example.com']
      };

      await sendEmailsWithSurveyLink(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().message).toMatch(/Emails sent successfully/);
      expect(sendEmail).toHaveBeenCalledTimes(2);
    });

    it('should handle survey not found', async () => {
      Survey.findOne = jest.fn().mockResolvedValue(null);

      mockReq.body = {
        surveyId: 'nonexistent',
        emails: ['user1@example.com']
      };

      await sendEmailsWithSurveyLink(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(404);
      expect(mockRes._getJSONData().message).toMatch(/Survey not found/);
    });

    it('should handle email sending errors', async () => {
      const mockSurvey = {
        _id: 'survey123',
        title: 'Customer Satisfaction Survey',
        uniqueLinkId: 'abc123'
      };

      Survey.findOne = jest.fn().mockResolvedValue(mockSurvey);
      sendEmail.mockRejectedValue(new Error('Email service error'));

      mockReq.body = {
        surveyId: 'survey123',
        emails: ['user1@example.com']
      };

      await sendEmailsWithSurveyLink(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes._getJSONData().message).toMatch(/Could not send survey emails/);
    });
  });
});
