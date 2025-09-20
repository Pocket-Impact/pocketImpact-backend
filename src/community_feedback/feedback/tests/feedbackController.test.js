import { jest } from '@jest/globals';

// Simple test for basic functionality
describe('FeedbackController', () => {
  it('should have expected exports', async () => {
    const feedbackController = await import('../controllers/feedbackController.js');
    expect(typeof feedbackController.submitFeedback).toBe('function');
    expect(typeof feedbackController.getFeedbackByOrganisation).toBe('function');
    expect(typeof feedbackController.deleteFeedback).toBe('function');
    expect(typeof feedbackController.analyzeUnprocessedFeedbacks).toBe('function');
  });
});
