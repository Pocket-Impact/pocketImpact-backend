import { Router } from "express";
import { protect, restrictTo, requireVerifiedUser } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { feedbackSchema } from "../schemas/feedbackSchema.js";
import { analyzeUnprocessedFeedbacks, deleteFeedback, getFeedbackByOrganisation, submitFeedback } from "../controllers/feedbackController.js";

const router = Router();

// Route to submit feedback
router.post('/', validate(feedbackSchema), submitFeedback);
// Route to get feedback by organisation ID
router.get('/', protect, requireVerifiedUser, getFeedbackByOrganisation);
//route to delete feedback by ID
router.delete('/:id', protect, restrictTo('admin'), deleteFeedback);
//route to analyze feedback sentiment
router.post('/analyze-sentiment', protect, restrictTo('admin'), requireVerifiedUser, analyzeUnprocessedFeedbacks);



export default router;