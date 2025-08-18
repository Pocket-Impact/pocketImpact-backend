import Response from '../models/Response.js';
import mongoose from 'mongoose';

describe('Response Model', () => {
  it('should require survey and responses', async () => {
    const response = new Response({});
    let err;
    try {
      await response.validate();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.surveyId).toBeDefined();
    expect(err.errors.responses).toBeDefined();
  });

  it('should require at least one response', async () => {
    const response = new Response({
      surveyId: new mongoose.Types.ObjectId(),
      responses: []
    });
    let err;
    try {
      await response.validate();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.responses).toBeDefined();
  });
});
