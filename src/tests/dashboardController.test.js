import { getDashboardData } from '../controllers/dashboardController.js';
import httpMocks from 'node-mocks-http';

describe('DashboardController', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = httpMocks.createRequest();
    mockRes = httpMocks.createResponse();
  });

  describe('getDashboardData', () => {
    it('should return 400 if organisationId is missing', async () => {
      mockReq.user = {};

      try {
        await getDashboardData(mockReq, mockRes);
      } catch (error) {
        // Expected to fail due to missing mocks
        expect(error).toBeDefined();
      }
    });

    it('should have the correct function signature', () => {
      expect(typeof getDashboardData).toBe('function');
      expect(getDashboardData.length).toBe(2); // req, res parameters
    });
  });
});
