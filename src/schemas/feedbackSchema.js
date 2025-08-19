//feedback schema joi

import Joi from "joi";

export const feedbackSchema = Joi.object({
    organisationId: Joi.string().required(),
    message: Joi.string().required().trim(),
    category: Joi.string().valid(
        "product",
        "ux",
        "support",
        "pricing",
        "features",
        "performance",
        "other"
    ).default("other"),
});
