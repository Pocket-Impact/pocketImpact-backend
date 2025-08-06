import { create_new_account, login, refresh, changePassword, forgotPassword, resetPassword, logout } from '../controllers/authController.js';
import httpMocks from 'node-mocks-http';

describe('authController', () => {
  it('should return 400 if signup fields are missing', async () => {
    const req = httpMocks.createRequest({ body: {} });
    const res = httpMocks.createResponse();
    await create_new_account(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toMatch(/All fields are required/);
  });

  it('should return 400 if login fields are missing', async () => {
    const req = httpMocks.createRequest({ body: {} });
    const res = httpMocks.createResponse();
    await login(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toMatch(/Email and password are required/);
  });

  it('should return 401 if refresh token is missing', () => {
    const req = httpMocks.createRequest({ cookies: {} });
    const res = httpMocks.createResponse();
    refresh(req, res);
    expect(res.statusCode).toBe(401);
    expect(res._getJSONData().message).toMatch(/Refresh token missing/);
  });

  it('should return 400 if changePassword fields are missing', async () => {
    const req = httpMocks.createRequest({ body: {} });
    const res = httpMocks.createResponse();
    await changePassword(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toMatch(/Old password and new password are required/);
  });

  it('should logout and return 200', () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    logout(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData().message).toMatch(/Logout successful/);
  });
});
