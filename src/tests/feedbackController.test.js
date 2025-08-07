import Feedback from '../models/Feedback.js';
import mongoose from 'mongoose';

describe('Feedback Model', () => {
  it('should require survey and feedbacks', async () => {
    const feedback = new Feedback({});
    let err;
    try {
      await feedback.validate();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.survey).toBeDefined();
    expect(err.errors.feedbacks).toBeDefined();
  });

  it('should require at least one feedback', async () => {
    const feedback = new Feedback({
      survey: new mongoose.Types.ObjectId(),
      feedbacks: []
    });
    let err;
    try {
      await feedback.validate();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.feedbacks).toBeDefined();
  });
});
