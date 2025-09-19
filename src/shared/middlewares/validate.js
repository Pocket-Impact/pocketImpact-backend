import Joi from 'joi';

export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      status: "fail",
      message: "Validation error",
      data: { errors: error.details.map(d => d.message) }
    });
  }
  req.body = value;
  next();
};