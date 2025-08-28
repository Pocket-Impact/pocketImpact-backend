import { Router } from "express";
import { submitResponse, getResponsesBySurvey, getResponsesByOrganisation, analyzeUnprocessedResponses } from "../controllers/responseController.js";
import { validate } from "../middlewares/validate.js";
import { responseSchema, getResponseBySurveySchema } from "../schemas/responseSchema.js";
import { protect, requireVerifiedUser, restrictTo } from "../middlewares/authMiddleware.js";

const router = Router();

// Route to submit response
router.post('/', validate(responseSchema), submitResponse);

// Route to get responses by organisation id
router.get('/organisation/',protect, validate(getResponseBySurveySchema), getResponsesByOrganisation);

// Route to get responses by survey ID
router.get('/survey/:surveyId',protect, validate(getResponseBySurveySchema), getResponsesBySurvey);
router.post('/analyze-sentiment/:surveyId', protect, restrictTo('admin'), requireVerifiedUser, analyzeUnprocessedResponses);


export default router;
