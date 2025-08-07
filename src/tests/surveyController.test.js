import { createSurvey, sendEmailsWithSurveyLink, getSurveysByOrganisation } from '../controllers/SurveyController.js';
import httpMocks from 'node-mocks-http';

describe('SurveyController', () => {
  it('should return 400 if survey creation fields are missing', async () => {
    const req = httpMocks.createRequest({ body: {} });
    const res = httpMocks.createResponse();
    await createSurvey(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toMatch(/Title, questions/);
  });

  it('should return 400 if sendEmailsWithSurveyLink fields are missing', async () => {
    const req = httpMocks.createRequest({ body: {} });
    const res = httpMocks.createResponse();
    await sendEmailsWithSurveyLink(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toMatch(/surveyId and emails are required/);
  });

  it('should return 400 if getSurveysByOrganisation param missing', async () => {
    const req = httpMocks.createRequest({ params: {} });
    const res = httpMocks.createResponse();
    await getSurveysByOrganisation(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().message).toMatch(/Organisation ID is required/);
  });
});
