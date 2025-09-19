import { jest } from '@jest/globals';

// Simple test for basic functionality
describe('SurveyController', () => {
  it('should have expected exports', async () => {
    const surveyController = await import('../controllers/surveyController.js');
    expect(typeof surveyController.createSurvey).toBe('function');
    expect(typeof surveyController.getSurveysByOrganisation).toBe('function');
    expect(typeof surveyController.sendEmailsWithSurveyLink).toBe('function');
  });
});
