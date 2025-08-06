import Joi from "joi";


export const feedbackSchema = Joi.object({
    surveyId: Joi.string().required(),
    feedbacks: Joi.array().items(
        Joi.object({
            questionId: Joi.string().required(),
            answer: Joi.string().required()
        })
    ).min(1).required()
});

export const getFeedbackBySurveySchema = Joi.object({
    surveyId: Joi.string().required()
});
