import Joi from "joi";


export const signupSchema = Joi.object({
  fullname: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phonenumber: Joi.string().required(),
  organisationName: Joi.string().required(),
  organisationCountry: Joi.string().required(),
  organisationSize: Joi.string().required(),
  password: Joi.string().min(6).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required()
});
