import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import generatePassword from './generatePassword.js';
import { generateOtp } from './generateOTP.js';
import { generateAccessToken, generateRefreshToken } from './generateTokens.js';

describe('utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ACCESS_TOKEN_SECRET = 'access_secret';
    process.env.REFRESH_TOKEN_SECRET = 'refresh_secret';
  });

  it('generatePassword returns a strong password', () => {
    const pwd = generatePassword();
    expect(typeof pwd).toBe('string');
    expect(pwd.length).toBeGreaterThanOrEqual(12);
  });

  it('generateOtp returns 6 digits and expiry in future', () => {
    const { otp, expires } = generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
    expect(expires).toBeInstanceOf(Date);
    expect(expires.getTime()).toBeGreaterThan(Date.now());
  });

  it('generateAccessToken signs with secret', () => {
    const mockSign = jest.spyOn(jwt, 'sign').mockReturnValue('token');
    const userId = '123';
    
    generateAccessToken(userId);
    
    expect(mockSign).toHaveBeenCalledWith(
      { id: userId },
      'access_secret',
      { expiresIn: '15m' }
    );
  });

  it('generateRefreshToken signs with secret', () => {
    const mockSign = jest.spyOn(jwt, 'sign').mockReturnValue('token');
    const userId = '123';
    
    generateRefreshToken(userId);
    
    expect(mockSign).toHaveBeenCalledWith(
      { id: userId },
      'refresh_secret',
      { expiresIn: '7d' }
    );
  });
});
