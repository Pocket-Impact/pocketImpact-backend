import { add_user_to_organisation, get_all_users, verifyOTP } from '../controllers/userController.js';
import httpMocks from 'node-mocks-http';

// Mock the models
jest.mock('../models/User.js');
jest.mock('../models/Organisation.js');
jest.mock('../utils/sendEmail.js');
jest.mock('../utils/generatePassword.js');

import User from '../models/User.js';
import Organisation from '../models/Organisation.js';
import { sendEmail } from '../utils/sendEmail.js';
import generatingPassword from '../utils/generatePassword.js';

describe('UserController', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = httpMocks.createRequest();
    mockRes = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('add_user_to_organisation', () => {
    it('should return 400 if required fields are missing', async () => {
      mockReq.body = {
        fullname: 'John Doe',
        email: 'john@example.com'
        // Missing phonenumber and role
      };

      await add_user_to_organisation(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/All fields are required/);
    });

    it('should return 400 if email already exists', async () => {
      User.findOne = jest.fn().mockResolvedValue({ email: 'john@example.com' });

      mockReq.body = {
        fullname: 'John Doe',
        email: 'john@example.com',
        phonenumber: '+1234567890',
        role: 'analyst'
      };

      await add_user_to_organisation(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Email already exists/);
    });

    it('should create user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        fullname: 'John Doe',
        email: 'john@example.com',
        phonenumber: '+1234567890',
        role: 'analyst',
        organisationId: 'org123'
      };

      User.findOne = jest.fn().mockResolvedValue(null); // Email doesn't exist
      generatingPassword.mockReturnValue('generatedPassword123');
      User.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockUser)
      }));
      sendEmail.mockResolvedValue();

      mockReq.body = {
        fullname: 'John Doe',
        email: 'john@example.com',
        phonenumber: '+1234567890',
        role: 'analyst'
      };
      mockReq.user = { organisationId: 'org123' };

      await add_user_to_organisation(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(201);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().data.user.email).toBe('john@example.com');
      expect(sendEmail).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      mockReq.body = {
        fullname: 'John Doe',
        email: 'john@example.com',
        phonenumber: '+1234567890',
        role: 'analyst'
      };

      await add_user_to_organisation(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes._getJSONData().message).toMatch(/Could not add user/);
    });
  });

  describe('get_all_users', () => {
    it('should return users successfully', async () => {
      const mockUsers = [
        {
          _id: 'user123',
          fullname: 'John Doe',
          email: 'john@example.com',
          role: 'analyst'
        }
      ];

      User.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockUsers)
        })
      });

      mockReq.user = { organisation: 'org123' };

      await get_all_users(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().data.users).toHaveLength(1);
    });

    it('should handle database errors', async () => {
      User.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      mockReq.user = { organisation: 'org123' };

      await get_all_users(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(500);
      expect(mockRes._getJSONData().message).toMatch(/Could not fetch users/);
    });
  });

  describe('verifyOTP', () => {
    it('should return 400 if OTP is missing', async () => {
      mockReq.body = {
        email: 'john@example.com'
        // Missing OTP
      };

      await verifyOTP(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Invalid OTP/);
    });

    it('should verify OTP successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        otp: '123456',
        otpExpires: new Date(Date.now() + 600000), // 10 minutes from now
        isVerified: false
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      mockUser.save = jest.fn().mockResolvedValue(mockUser);

      mockReq.body = {
        email: 'john@example.com',
        otp: '123456'
      };

      await verifyOTP(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(200);
      expect(mockRes._getJSONData().status).toBe('success');
      expect(mockRes._getJSONData().message).toMatch(/Account verified successfully/);
    });

    it('should return 400 if OTP is invalid', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        otp: '123456',
        otpExpires: new Date(Date.now() + 600000)
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      mockReq.body = {
        email: 'john@example.com',
        otp: '654321' // Wrong OTP
      };

      await verifyOTP(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/Invalid OTP/);
    });

    it('should return 400 if OTP is expired', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        otp: '123456',
        otpExpires: new Date(Date.now() - 600000) // Expired 10 minutes ago
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      mockReq.body = {
        email: 'john@example.com',
        otp: '123456'
      };

      await verifyOTP(mockReq, mockRes);

      expect(mockRes.statusCode).toBe(400);
      expect(mockRes._getJSONData().message).toMatch(/OTP expired/);
    });
  });
});
