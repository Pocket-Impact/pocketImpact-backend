import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';
import jwt from 'jsonwebtoken';

jest.unstable_mockModule('../../core/models/User.js', () => ({
  default: {
    findById: jest.fn(),
  },
}));

const { protect, restrictTo, requireVerifiedUser } = await import('../../shared/middlewares/authMiddleware.js');
const User = (await import('../../core/models/User.js')).default;

describe('authMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ACCESS_TOKEN_SECRET = 'test_access_secret';
  });

  describe('protect', () => {
    it('returns 401 when no token', async () => {
      const req = httpMocks.createRequest({ cookies: {} });
      const res = httpMocks.createResponse();
      const next = jest.fn();

      await protect(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when jwt invalid', async () => {
      const req = httpMocks.createRequest({ cookies: { accessToken: 'bad' } });
      const res = httpMocks.createResponse();
      const next = jest.fn();

      jest.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('bad'); });

      await protect(req, res, next);

      expect(res.statusCode).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('attaches user and calls next on success', async () => {
      const req = httpMocks.createRequest({ cookies: { accessToken: 'good' } });
      const res = httpMocks.createResponse();
      const next = jest.fn();

      jest.spyOn(jwt, 'verify').mockReturnValue({ id: 'u1' });
      User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: 'u1', role: 'admin', organisationId: 'o1' }) });

      await protect(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual({ id: 'u1', role: 'admin', organisationId: 'o1' });
    });
  });

  describe('restrictTo', () => {
    it('forbids when role not allowed', () => {
      const req = httpMocks.createRequest();
      req.user = { role: 'analyst' };
      const res = httpMocks.createResponse();
      const next = jest.fn();

      restrictTo('admin')(req, res, next);

      expect(res.statusCode).toBe(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('allows when role permitted', () => {
      const req = httpMocks.createRequest();
      req.user = { role: 'admin' };
      const res = httpMocks.createResponse();
      const next = jest.fn();

      restrictTo('admin')(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireVerifiedUser', () => {
    it('403 when user not verified', async () => {
      const req = httpMocks.createRequest();
      req.user = { id: 'u1' };
      const res = httpMocks.createResponse();
      const next = jest.fn();

      User.findById.mockResolvedValue({ _id: 'u1', isVerified: false });

      await requireVerifiedUser(req, res, next);

      expect(res.statusCode).toBe(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next when verified', async () => {
      const req = httpMocks.createRequest();
      req.user = { id: 'u2' };
      const res = httpMocks.createResponse();
      const next = jest.fn();

      User.findById.mockResolvedValue({ _id: 'u2', isVerified: true });

      await requireVerifiedUser(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});



