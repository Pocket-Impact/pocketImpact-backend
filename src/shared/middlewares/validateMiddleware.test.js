import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';
import Joi from 'joi';

import { validate } from './validate.js';

describe('validate middleware', () => {
  const schema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().integer().min(0).required(),
  });

  it('returns 400 on validation error', () => {
    const req = httpMocks.createRequest({ method: 'POST', url: '/', body: { name: 'Jane' } });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(res.statusCode).toBe(400);
    const data = res._getJSONData();
    expect(data.status).toBe('fail');
    expect(data.message).toBe('Validation error');
    expect(data.data.errors).toContain('"age" is required');
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next and sets sanitized body on success', () => {
    const req = httpMocks.createRequest({ method: 'POST', url: '/', body: { name: 'Jane', age: 30 } });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(req.body).toEqual({ name: 'Jane', age: 30 });
    expect(next).toHaveBeenCalled();
  });
});
