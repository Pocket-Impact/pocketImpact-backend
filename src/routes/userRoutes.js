import { Router } from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { get_all_users,add_user_to_organisation, verifyOTP, resendOTP, updateUser } from "../controllers/userController.js";
import { validate } from "../middlewares/validate.js";
import { updateUserSchema, userSchema } from "../schemas/userSchemas.js";
 
const router = Router();
 
router.post('/add-user', protect, restrictTo('admin'),validate(userSchema), add_user_to_organisation);
router.get('/all-users', protect, restrictTo('admin'), get_all_users);
// route to edit user details
router.put('/update-user', protect, restrictTo('admin'), validate(updateUserSchema), updateUser);
export default router;