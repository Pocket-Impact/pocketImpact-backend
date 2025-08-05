import { Router } from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { get_all_users,add_user_to_organisation } from "../controllers/userController.js";

const router = Router();

// Route to add a user to an organisation
router.post('/add-user', protect, restrictTo('admin'), add_user_to_organisation);
// Route to get all users in an organisation
router.get('/all-users', protect, restrictTo('admin'), get_all_users);

export default router;