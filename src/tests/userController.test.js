import { add_user_to_organisation } from '../controllers/userController.js';
import httpMocks from 'node-mocks-http';

describe('add_user_to_organisation', () => {
  it('should return 400 if required fields are missing', async () => {
    const req = httpMocks.createRequest({
      body: { email: '', fullname: '', phonenumber: '', role: '' }
    });
    const res = httpMocks.createResponse();
    await add_user_to_organisation(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toMatch(/All fields are required/);
  });
});
