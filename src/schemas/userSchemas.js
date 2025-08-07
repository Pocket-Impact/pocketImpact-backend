
import Joi from "joi";

export const userSchema = Joi.object({
    fullname: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phonenumber: Joi.string().required(),
    role: Joi.string().valid('admin', 'analyst','reseacher').default('reseacher'),
});


export const verifyOTPSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
});

export const resendOTPSchema = Joi.object({
    email: Joi.string().email().required(),
});

export const updateUserSchema = Joi.object({
    fullname: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    phonenumber: Joi.string().optional(),
    role: Joi.string().valid('admin', 'analyst', 'reseacher').optional(),
});