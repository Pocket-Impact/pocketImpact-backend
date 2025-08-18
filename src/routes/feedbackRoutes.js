import { Router } from "express";
import { protect, restrictTo, requireVerifiedUser } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { feedbackSchema } from "../schemas/feedbackSchema.js";
import { getFeedbackByOrganisation, submitFeedback } from "../controllers/feedbackController.js";

const router = Router();

// Route to submit feedback
router.post('/', validate(feedbackSchema), submitFeedback);
// Route to get feedback by organisation ID
router.get('/:organisationId', protect, requireVerifiedUser, getFeedbackByOrganisation);

export default router;