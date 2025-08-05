import { Router } from "express";
import { create_new_account, login } from "../controllers/authController.js";

const router = Router();

// Route to create a new account
router.post('/signup', create_new_account);
router.post('/login', login);

export default router;