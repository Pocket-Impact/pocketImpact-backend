import Joi from 'joi';
import User from '../models/User.js';

describe('User Model', () => {
  it('should require email and password', async () => {
    const user = new User({});
    let err;
    try {
      await user.validate();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });
});
