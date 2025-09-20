import { jest } from '@jest/globals';

// Simple test for basic functionality
describe('DashboardController', () => {
  it('should have expected exports', async () => {
    const dashboardController = await import('../controllers/dashboardController.js');
    expect(typeof dashboardController.getDashboardData).toBe('function');
    expect(typeof dashboardController.getOrganisationData).toBe('function');
    expect(typeof dashboardController.getDailyCategoriesData).toBe('function');
  });
});
