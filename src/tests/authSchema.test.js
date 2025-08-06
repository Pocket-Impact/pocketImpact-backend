import Joi from 'joi';

describe('Auth Schemas', () => {
  it('should validate login schema', () => {
    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    });
    const valid = { email: 'test@example.com', password: '123456' };
    const { error } = loginSchema.validate(valid);
    expect(error).toBeUndefined();
  });

  it('should fail login schema if email is invalid', () => {
    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    });
    const invalid = { email: 'bademail', password: '123456' };
    const { error } = loginSchema.validate(invalid);
    expect(error).toBeDefined();
  });
});
