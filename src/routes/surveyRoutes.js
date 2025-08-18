import { Router } from "express";
import { protect, restrictTo, requireVerifiedUser } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { sendSurveyByUniqueLinkSchema, surveySchema } from "../schemas/surveySchema.js";
import { getResponsesBySurvey } from "../controllers/responseController.js";
import roles from "../utils/roles.js";
import { createSurvey, deleteSurveyById, getSurveryByUniqueLinkId, getSurveysByOrganisation, sendEmailsWithSurveyLink, updateSurveyById } from "../controllers/SurveyController.js";


const router = Router();

// Route to create a new survey
router.post('/', protect, requireVerifiedUser, restrictTo(roles.ADMIN,roles.ANALYST),validate(surveySchema), createSurvey);

// Route to get all surveys for an organisation
router.get('/', protect, requireVerifiedUser, restrictTo(roles.ADMIN,roles.ANALYST,roles.RESEARCHER), getSurveysByOrganisation);

// Route to send survey link via email
router.post('/send-survey-link', protect, requireVerifiedUser, restrictTo(roles.ADMIN,roles.ANALYST),validate(sendSurveyByUniqueLinkSchema), sendEmailsWithSurveyLink);

// Route to get a survey by unique link ID
router.get('/unique/:uniqueLinkId', getSurveryByUniqueLinkId);

// Route to delete a survey by ID
router.delete('/:surveyId', protect, requireVerifiedUser, restrictTo(roles.ADMIN,roles.ANALYST), deleteSurveyById);

// Route to update a survey by ID
router.put('/:surveyId', protect, requireVerifiedUser, restrictTo(roles.ADMIN,roles.ANALYST), updateSurveyById);

export default router;