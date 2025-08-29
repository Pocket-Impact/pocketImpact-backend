import { create_new_account, login, refresh, changePassword, forgotPassword, resetPassword, logout, check } from '../controllers/authController.js';
import httpMocks from 'node-mocks-http';

// Mock the models and utilities
jest.mock('../models/User.js');
jest.mock('../models/Organisation.js');
jest.mock('../utils/generateOTP.js');
jest.mock('../utils/sendEmail.js');
jest.mock('../utils/generateTokens.js');
jest.mock('crypto');

import User from '../models/User.js';
import Organisation from '../models/Organisation.js';
import { generateOtp } from '../utils/generateOTP.js';
import { sendEmail } from '../utils/sendEmail.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js';
import crypto from 'crypto';

describe('AuthController', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = httpMocks.createRequest();
    mockRes = httpMocks.createResponse();
    jest.clearAllMocks();
    
    // Mock OTP generation
    generateOtp.mockReturnValue({ otp: '123456', expires: new Date() });
    
    // Mock token generation
    generateAccessToken.mockReturnValue('access_token_123');
    generateRefreshToken.mockReturnValue('refresh_token_123');
    
    // Mock crypto.randomBytes
    crypto.randomBytes = jest.fn().mockReturnValue({ toString: () => 'reset_token_123' });
  });

  describe('create_new_account', () => {
    it('should return 400 if required fields are missing', async () => {
      mockReq.body = {
        fullname: 'Jane Doe',
        email: 'jane@example.com'
        // Missing other required fields
      };

      await create_new_account(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/All fields are required/);
    });

    it('should return 400 if password is too short', async () => {
      mockReq.body = {
        fullname: 'Jane Doe',
        email: 'jane@example.com',
        phonenumber: '+1234567890',
        organisationName: 'Acme Corp',
        organisationCountry: 'USA',
        organisationSize: 'medium',
        password: '123' // Too short
      };

      await create_new_account(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Password must be at least 6 characters long/);
    });

    it('should return 400 if email format is invalid', async () => {
      mockReq.body = {
        fullname: 'Jane Doe',
        email: 'invalid-email',
        phonenumber: '+1234567890',
        organisationName: 'Acme Corp',
        organisationCountry: 'USA',
        organisationSize: 'medium',
        password: 'securePassword123'
      };

      await create_new_account(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Invalid email format/);
    });

    it('should return 400 if phone number format is invalid', async () => {
      mockReq.body = {
        fullname: 'Jane Doe',
        email: 'jane@example.com',
        phonenumber: 'invalid-phone',
        organisationName: 'Acme Corp',
        organisationCountry: 'USA',
        organisationSize: 'medium',
        password: 'securePassword123'
      };

      await create_new_account(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Invalid phone number format/);
    });

    it('should return 400 if email already exists', async () => {
      User.findOne = jest.fn().mockResolvedValue({ email: 'jane@example.com' });

      mockReq.body = {
        fullname: 'Jane Doe',
        email: 'jane@example.com',
        phonenumber: '+1234567890',
        organisationName: 'Acme Corp',
        organisationCountry: 'USA',
        organisationSize: 'medium',
        password: 'securePassword123'
      };

      await create_new_account(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Email already exists/);
    });

    it('should return 400 if organisation already exists', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);
      Organisation.findOne = jest.fn().mockResolvedValue({
        organisationName: 'Acme Corp',
        organisationCountry: 'USA',
        organisationSize: 'medium'
      });

      mockReq.body = {
        fullname: 'Jane Doe',
        email: 'jane@example.com',
        phonenumber: '+1234567890',
        organisationName: 'Acme Corp',
        organisationCountry: 'USA',
        organisationSize: 'medium',
        password: 'securePassword123'
      };

      await create_new_account(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Organisation already exists ask your admin to add you to the organisation/);
    });

    it('should create account successfully', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);
      Organisation.findOne = jest.fn().mockResolvedValue(null);
      
      const mockOrganisation = {
        _id: 'org123',
        organisationName: 'Acme Corp'
      };
      
      const mockUser = {
        _id: 'user123',
        fullname: 'Jane Doe',
        email: 'jane@example.com',
        role: 'admin'
      };

      Organisation.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockOrganisation)
      }));

      User.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockUser)
      }));

      sendEmail.mockResolvedValue();

      mockReq.body = {
        fullname: 'Jane Doe',
        email: 'jane@example.com',
        phonenumber: '+1234567890',
        organisationName: 'Acme Corp',
        organisationCountry: 'USA',
        organisationSize: 'medium',
        password: 'securePassword123'
      };

      await create_new_account(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(201);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().data.user.email).toBe('jane@example.com');
      expect(sendEmail).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      mockReq.body = {
        fullname: 'Jane Doe',
        email: 'jane@example.com',
        phonenumber: '+1234567890',
        organisationName: 'Acme Corp',
        organisationCountry: 'USA',
        organisationSize: 'medium',
        password: 'securePassword123'
      };

      await create_new_account(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes._getJSONData().message).toMatch(/Internal server error/);
    });
  });

  describe('login', () => {
    it('should return 400 if email or password is missing', async () => {
      mockReq.body = {
        email: 'jane@example.com'
        // Missing password
      };

      await login(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Email and password are required/);
    });

    it('should return 401 if login fails', async () => {
      User.login = jest.fn().mockRejectedValue(new Error('Incorrect email or password!'));

      mockReq.body = {
        email: 'jane@example.com',
        password: 'wrongpassword'
      };

      await login(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(401);
      expect(mockRes._getJSONData().message).toMatch(/Invalid email or password!/);
    });

    it('should login successfully and set cookies', async () => {
      const mockUser = {
        _id: 'user123',
        fullname: 'Jane Doe',
        email: 'jane@example.com',
        isVerified: true,
        role: 'admin',
        phonenumber: '+1234567890',
        organisationId: 'org123',
        organisationName: 'Acme Corp'
      };

      User.login = jest.fn().mockResolvedValue(mockUser);

      mockReq.body = {
        email: 'jane@example.com',
        password: 'correctpassword'
      };

      await login(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().data.user.email).toBe('jane@example.com');
      
      // Check that cookies are set
      const cookies = mockRes._getCookies();
      expect(cookies.accessToken).toBeDefined();
      expect(cookies.refreshToken).toBeDefined();
    });
  });

  describe('refresh', () => {
    it('should return 401 if refresh token is missing', async () => {
      mockReq.cookies = {};

      await refresh(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(401);
      expect(mockRes._getJSONData().message).toMatch(/Refresh token missing/);
    });

    it('should return 401 if refresh token is invalid', async () => {
      // Mock JWT verify to throw error
      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      mockReq.cookies = { refreshToken: 'invalid_token' };

      await refresh(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(401);
      expect(mockRes._getJSONData().message).toMatch(/Invalid or expired refresh token/);
    });

    it('should refresh token successfully', async () => {
      // Mock JWT verify to return valid payload
      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({ id: 'user123' });

      mockReq.cookies = { refreshToken: 'valid_token' };

      await refresh(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().accessToken).toBeDefined();
    });
  });

  describe('changePassword', () => {
    it('should return 400 if old password or new password is missing', async () => {
      mockReq.body = {
        oldPassword: 'oldpassword'
        // Missing newPassword
      };

      await changePassword(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Old password and new password are required/);
    });

    it('should change password successfully', async () => {
      const mockUser = {
        _id: 'user123',
        password: 'oldpassword'
      };

      User.findById = jest.fn().mockResolvedValue(mockUser);
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      mockReq.body = {
        oldPassword: 'oldpassword',
        newPassword: 'newpassword123'
      };
      mockReq.user = { id: 'user123' };

      await changePassword(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().message).toMatch(/Password changed successfully/);
    });
  });

  describe('forgotPassword', () => {
    it('should return 400 if email is missing', async () => {
      mockReq.body = {};

      await forgotPassword(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Email is required/);
    });

    it('should send password reset email successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'jane@example.com'
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);
      sendEmail.mockResolvedValue();

      mockReq.body = { email: 'jane@example.com' };

      await forgotPassword(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().message).toMatch(/Password reset link sent to your email/);
      expect(sendEmail).toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);

      mockReq.body = { email: 'nonexistent@example.com' };

      await forgotPassword(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(404);
      expect(mockRes._getJSONData().message).toMatch(/No account found with that email address/);
    });
  });

  describe('resetPassword', () => {
    it('should return 400 if token or new password is missing', async () => {
      mockReq.body = {
        token: 'reset_token'
        // Missing newPassword
      };

      await resetPassword(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Token and new password are required/);
    });

    it('should reset password successfully', async () => {
      const mockUser = {
        _id: 'user123',
        resetPasswordToken: 'reset_token_123',
        resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour from now
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      mockReq.body = {
        token: 'reset_token_123',
        newPassword: 'newpassword123'
      };

      await resetPassword(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().message).toMatch(/Password has been reset successfully/);
    });

    it('should return 400 if token is invalid', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);

      mockReq.body = {
        token: 'invalid_token',
        newPassword: 'newpassword123'
      };

      await resetPassword(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Invalid or expired password reset token/);
    });
  });

  describe('check', () => {
    it('should return user info successfully', async () => {
      const mockUser = {
        _id: 'user123',
        role: 'admin',
        organisationId: 'org123'
      };

      mockReq.user = mockUser;

      await check(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().user.id).toBe('user123');
      expect(mockRes._getJSONData().user.role).toBe('admin');
    });
  });

  describe('logout', () => {
    it('should logout successfully and clear cookies', async () => {
      await logout(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().message).toMatch(/Logged out successfully/);
      
      // Check that cookies are cleared
      const cookies = mockRes._getCookies();
      expect(cookies.accessToken).toBe('');
      expect(cookies.refreshToken).toBe('');
    });
  });
});
