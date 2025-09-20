import Joi from "joi";

export const responseSchema = Joi.object({
    surveyId: Joi.string().required(),
    responses: Joi.array().items(
        Joi.object({
            questionId: Joi.string().required(),
            answer: Joi.string().required()
        })
    ).min(1).required()
});

export const getResponseBySurveySchema = Joi.object({
    surveyId: Joi.string().required()
});
