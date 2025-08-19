import { Router } from "express";
import { submitResponse, getResponsesBySurvey, getResponsesByOrganisation } from "../controllers/responseController.js";
import { validate } from "../middlewares/validate.js";
import { responseSchema, getResponseBySurveySchema } from "../schemas/responseSchema.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

// Route to submit response
router.post('/', validate(responseSchema), submitResponse);

// Route to get responses by organisation id
router.get('/organisation/',protect, validate(getResponseBySurveySchema), getResponsesByOrganisation);

// Route to get responses by survey ID
router.get('/survey/:surveyId',protect, validate(getResponseBySurveySchema), getResponsesBySurvey);

export default router;
