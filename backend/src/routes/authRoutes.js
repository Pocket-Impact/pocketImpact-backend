import { Router } from "express";
import { create_new_account, forgotPassword, login, logout, resetPassword} from "../controllers/authController.js";

const router = Router();

// Route to create a new account
router.post('/signup', create_new_account);
router.post('/login', login);
router.get('/logout',logout);
router.post('/forgot-password',forgotPassword);
router.post('/reset-password', resetPassword);



export default router;

