import { Router } from "express";
import { submitFeedback,getFeedbackBySurvey } from "../controllers/feedbackController.js";
import { validate } from "../middlewares/validate.js";
import { feedbackSchema, getFeedbackBySurveySchema } from "../schemas/feedbackSchema.js";

const router = Router();

// Route to submit feedback
router.post('/',validate(feedbackSchema), submitFeedback);
// Route to get feedback by survey ID

router.get('/:surveyId',validate(getFeedbackBySurveySchema), getFeedbackBySurvey);
export default router;
