import { Router } from "express";
import { check, create_new_account, forgotPassword, login, logout, refresh, resendOTP, resetPassword, verifyOTP } from "../controllers/authController.js";
import Joi from "joi";
import { validate } from "../../shared/middlewares/validate.js";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema, signupSchema } from "../schemas/authSchemas.js";
import { resendOTPSchema, verifyOTPSchema } from "../schemas/userSchemas.js";
import { protect } from "../../shared/middlewares/authMiddleware.js";
const router = Router();



// Route to create a new account
router.post('/signup', validate(signupSchema), create_new_account);
router.post('/login', validate(loginSchema), login);
router.get('/logout', logout);
router.post('/refresh-token', refresh);
router.get('/check', protect, check);

// Password reset routes
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

//otp
router.post('/verify-otp', protect, validate(verifyOTPSchema), verifyOTP);
router.get('/resend-otp', protect, validate(resendOTPSchema), resendOTP);

export default router;

