import { Router } from "express";
import { submitFeedback,getFeedbackBySurvey } from "../controllers/feedbackController.js";

const router = Router();

// Route to submit feedback
router.post('/', submitFeedback);
// Route to get feedback by survey ID
router.get('/:surveyId', getFeedbackBySurvey);
export default router;
