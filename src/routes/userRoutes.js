import { Router } from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { get_all_users,add_user_to_organisation, verifyOTP, resendOTP } from "../controllers/userController.js";
 
const router = Router();
 
router.post('/add-user', protect, restrictTo('admin'), add_user_to_organisation);
router.get('/all-users', protect, restrictTo('admin'), get_all_users);
router.post('/verify-otp',protect, verifyOTP);
router.get('/resend-otp',protect, resendOTP);
export default router;