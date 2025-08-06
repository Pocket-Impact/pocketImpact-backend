import { Router } from "express";
import { createSurvey, getSurveysByOrganisation, getSurveryByUniqueLinkId, sendEmailsWithSurveyLink, deleteSurveyById, updateSurveyById } from "../controllers/surveyController.js";
import { protect, restrictTo, requireVerifiedUser } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { sendSurveyByUniqueLinkSchema, surveySchema } from "../schemas/surveySchema.js";
import { getFeedbackBySurvey } from "../controllers/feedbackController.js";


const router = Router();
// Route to create a new survey
router.post('/', protect, requireVerifiedUser, restrictTo('admin','analyst'),validate(surveySchema), createSurvey);
// Route to get all surveys for an organisation
router.get('/:organisationId', protect, requireVerifiedUser, restrictTo('admin', 'analyst', 'researcher'), getSurveysByOrganisation);

// Route to send survey link via email
router.post('/send-survey-link', protect, requireVerifiedUser, restrictTo('admin', 'analyst'),validate(sendSurveyByUniqueLinkSchema), sendEmailsWithSurveyLink);
// Route to get a survey by unique link ID
router.get('/unique/:uniqueLinkId', getSurveryByUniqueLinkId);

// Route to delete a survey by ID
router.delete('/:surveyId', protect, requireVerifiedUser, restrictTo('admin', 'analyst'), deleteSurveyById);
// Route to update a survey by ID
router.put('/:surveyId', protect, requireVerifiedUser, restrictTo('admin', 'analyst'), updateSurveyById);

export default router;