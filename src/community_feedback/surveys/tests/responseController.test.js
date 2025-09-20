import { jest } from '@jest/globals';

// Simple test for basic functionality
describe('ResponseController', () => {
  it('should have expected exports', async () => {
    const responseController = await import('../controllers/responseController.js');
    expect(typeof responseController.submitResponse).toBe('function');
    expect(typeof responseController.getResponsesBySurvey).toBe('function');
    expect(typeof responseController.getResponsesByOrganisation).toBe('function');
  });
});
