import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';

// Simple test for basic functionality
describe('AuthController', () => {
  it('should have expected exports', async () => {
    const authController = await import('../controllers/authController.js');
    expect(typeof authController.create_new_account).toBe('function');
    expect(typeof authController.login).toBe('function');
    expect(typeof authController.refresh).toBe('function');
    expect(typeof authController.changePassword).toBe('function');
    expect(typeof authController.forgotPassword).toBe('function');
    expect(typeof authController.resetPassword).toBe('function');
    expect(typeof authController.check).toBe('function');
    expect(typeof authController.logout).toBe('function');
  });

  it('should validate required fields in create_new_account', async () => {
    const authController = await import('../controllers/authController.js');
    const mockReq = httpMocks.createRequest({
      body: {
        fullname: 'John Doe',
        email: 'john@example.com'
        // Missing required fields
      }
    });
    const mockRes = httpMocks.createResponse();

    await authController.create_new_account(mockReq, mockRes);

    expect(mockRes.statusCode).toBe(400);
    expect(mockRes._getJSONData().message).toBe('All fields are required');
  });

  it('should validate password length', async () => {
    const authController = await import('../controllers/authController.js');
    const mockReq = httpMocks.createRequest({
      body: {
        fullname: 'John Doe',
        email: 'john@example.com',
        phonenumber: '+1234567890',
        organisationName: 'Test Org',
        organisationCountry: 'Kenya',
        organisationSize: 'medium',
        password: '123' // Too short
      }
    });
    const mockRes = httpMocks.createResponse();

    await authController.create_new_account(mockReq, mockRes);

    expect(mockRes.statusCode).toBe(400);
    expect(mockRes._getJSONData().message).toBe('Password must be at least 6 characters long');
  });

  it('should validate email format', async () => {
    const authController = await import('../controllers/authController.js');
    const mockReq = httpMocks.createRequest({
      body: {
        fullname: 'John Doe',
        email: 'invalid-email',
        phonenumber: '+1234567890',
        organisationName: 'Test Org',
        organisationCountry: 'Kenya',
        organisationSize: 'medium',
        password: 'password123'
      }
    });
    const mockRes = httpMocks.createResponse();

    await authController.create_new_account(mockReq, mockRes);

    expect(mockRes.statusCode).toBe(400);
    expect(mockRes._getJSONData().message).toBe('Invalid email format');
  });
});