import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';

// Simple test for basic functionality
describe('UserController', () => {
  it('should have expected exports', async () => {
    const userController = await import('../controllers/userController.js');
    expect(typeof userController.add_user_to_organisation).toBe('function');
    expect(typeof userController.get_all_users).toBe('function');
    expect(typeof userController.updateUser).toBe('function');
    expect(typeof userController.deleteUser).toBe('function');
  });

  it('should validate required fields in add_user_to_organisation', async () => {
    const userController = await import('../controllers/userController.js');
    const mockReq = httpMocks.createRequest({
      body: {
        fullname: 'John Doe',
        email: 'john@example.com'
        // Missing required fields
      }
    });
    const mockRes = httpMocks.createResponse();

    await userController.add_user_to_organisation(mockReq, mockRes);

    expect(mockRes.statusCode).toBe(400);
    expect(mockRes._getJSONData().message).toBe('All fields are required');
  });

  it('should validate email format in add_user_to_organisation', async () => {
    const userController = await import('../controllers/userController.js');
    const mockReq = httpMocks.createRequest({
      body: {
        fullname: 'John Doe',
        email: 'invalid-email',
        phonenumber: '+1234567890',
        role: 'analyst'
      }
    });
    const mockRes = httpMocks.createResponse();

    await userController.add_user_to_organisation(mockReq, mockRes);

    expect(mockRes.statusCode).toBe(400);
    expect(mockRes._getJSONData().message).toBe('Invalid email format');
  });

  it('should validate required fields in updateUser', async () => {
    const userController = await import('../controllers/userController.js');
    const mockReq = httpMocks.createRequest({
      body: {
        id: 'user123',
        fullname: 'John Doe'
        // Missing required fields
      }
    });
    const mockRes = httpMocks.createResponse();

    await userController.updateUser(mockReq, mockRes);

    expect(mockRes.statusCode).toBe(400);
    expect(mockRes._getJSONData().message).toBe('All fields are required');
  });

  it('should validate user ID in deleteUser', async () => {
    const userController = await import('../controllers/userController.js');
    const mockReq = httpMocks.createRequest({
      params: {} // No ID provided
    });
    const mockRes = httpMocks.createResponse();

    await userController.deleteUser(mockReq, mockRes);

    expect(mockRes.statusCode).toBe(400);
    expect(mockRes._getJSONData().message).toBe('User ID is required');
  });
});