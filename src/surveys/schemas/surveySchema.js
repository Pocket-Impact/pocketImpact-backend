import Joi from "joi";

export const surveySchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).optional(),
    questions: Joi.array().items(
        Joi.object({
            questionText: Joi.string().required(),
            type: Joi.string().valid('text', 'choice', 'rating').required(),
            options: Joi.array().items(Joi.string()).optional()
        })
    ).min(1).required()
});
export const getSurveyByIdSchema = Joi.object({
    surveyId: Joi.string().required()
});

export const sendSurveyByUniqueLinkSchema = Joi.object({
    surveyId: Joi.string().required(),
    emails: Joi.array().items(
        Joi.string().email()
    ).min(1).required()
});

export const getSurveyByUniqueLinkSchema = Joi.object({
    uniqueLinkId: Joi.string().required()
});
export const deleteSurveyByIdSchema = Joi.object({
    surveyId: Joi.string().required()
});
export const updateSurveyByIdSchema = Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional(),
    questions: Joi.array().items(
        Joi.object({
            questionText: Joi.string().required(),
            questionType: Joi.string().valid('text', 'multiple-choice', 'rating').required(),
            options: Joi.array().items(Joi.string()).optional()
        })
    ).min(1).optional()
}).or('title', 'description', 'questions');
