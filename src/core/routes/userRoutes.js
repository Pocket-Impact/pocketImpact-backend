import { Router } from "express";
import { protect, restrictTo } from "../../shared/middlewares/authMiddleware.js";
import { get_all_users,add_user_to_organisation, updateUser, deleteUser } from "../controllers/userController.js";
import { validate } from "../../shared/middlewares/validate.js";
import { updateUserSchema, userSchema } from "../schemas/userSchemas.js";
import roles from "../../shared/utils/roles.js";
 
const router = Router();
 
router.post('/add-user', protect, restrictTo(roles.ADMIN),validate(userSchema), add_user_to_organisation);
router.get('/all-users', protect, restrictTo(roles.ADMIN), get_all_users);
// route to edit user details
router.put('/update-user', protect, restrictTo(roles.ADMIN), validate(updateUserSchema), updateUser);
export default router;

//delete user added to the organisation
router.delete('/delete-user/:id', protect, restrictTo(roles.ADMIN),deleteUser);