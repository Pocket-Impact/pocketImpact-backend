import Joi from 'joi';
import { DEFAULTS, FEEDBACK_CATEGORIES, USER_ROLES_ARRAY } from '../constants/reports.js';

/**
 * Base schema for date range validation
 */
const dateRangeSchema = Joi.object({
    startDate: Joi.date().iso().optional()
        .messages({
            'date.base': 'Start date must be a valid date',
            'date.format': 'Start date must be in ISO format (YYYY-MM-DD)'
        }),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
        .messages({
            'date.base': 'End date must be a valid date',
            'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
            'date.min': 'End date must be after or equal to start date'
        })
}).custom((value, helpers) => {
    const { startDate, endDate } = value;
    
    // If startDate is provided, endDate must also be provided
    if (startDate && !endDate) {
        return helpers.error('any.invalid', { 
            message: 'End date is required when start date is provided' 
        });
    }
    
    // If endDate is provided, startDate must also be provided
    if (endDate && !startDate) {
        return helpers.error('any.invalid', { 
            message: 'Start date is required when end date is provided' 
        });
    }
    
    return value;
});

/**
 * Schema for survey reports query parameters
 */
export const surveyReportsSchema = Joi.object({
    ...dateRangeSchema.describe().keys,
    surveyId: Joi.string().hex().length(24).optional()
        .messages({
            'string.hex': 'Survey ID must be a valid hexadecimal string',
            'string.length': 'Survey ID must be exactly 24 characters long'
        })
});

/**
 * Schema for response reports query parameters
 */
export const responseReportsSchema = Joi.object({
    ...dateRangeSchema.describe().keys,
    surveyId: Joi.string().hex().length(24).optional()
        .messages({
            'string.hex': 'Survey ID must be a valid hexadecimal string',
            'string.length': 'Survey ID must be exactly 24 characters long'
        })
});

/**
 * Schema for feedback reports query parameters
 */
export const feedbackReportsSchema = Joi.object({
    ...dateRangeSchema.describe().keys,
    category: Joi.string().valid(...FEEDBACK_CATEGORIES).optional()
        .messages({
            'any.only': `Category must be one of: ${FEEDBACK_CATEGORIES.join(', ')}`
        })
});

/**
 * Schema for user activity reports query parameters
 */
export const userActivityReportsSchema = Joi.object({
    ...dateRangeSchema.describe().keys,
    role: Joi.string().valid(...USER_ROLES_ARRAY).optional()
        .messages({
            'any.only': `Role must be one of: ${USER_ROLES_ARRAY.join(', ')}`
        })
});

/**
 * Schema for executive summary query parameters
 */
export const executiveSummarySchema = Joi.object({
    period: Joi.number().integer().min(DEFAULTS.MIN_PERIOD_DAYS).max(DEFAULTS.MAX_PERIOD_DAYS)
        .default(DEFAULTS.PERIOD_DAYS)
        .messages({
            'number.base': 'Period must be a number',
            'number.integer': 'Period must be a whole number',
            'number.min': `Period must be at least ${DEFAULTS.MIN_PERIOD_DAYS} day`,
            'number.max': `Period cannot exceed ${DEFAULTS.MAX_PERIOD_DAYS} days`
        })
});

/**
 * Schema for pagination parameters
 */
export const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1)
        .messages({
            'number.base': 'Page must be a number',
            'number.integer': 'Page must be a whole number',
            'number.min': 'Page must be at least 1'
        }),
    limit: Joi.number().integer().min(1).max(DEFAULTS.MAX_PAGE_SIZE).default(DEFAULTS.PAGE_SIZE)
        .messages({
            'number.base': 'Limit must be a number',
            'number.integer': 'Limit must be a whole number',
            'number.min': 'Limit must be at least 1',
            'number.max': `Limit cannot exceed ${DEFAULTS.MAX_PAGE_SIZE}`
        })
});

/**
 * Schema for export format validation
 */
export const exportFormatSchema = Joi.object({
    format: Joi.string().valid('json', 'csv', 'pdf').default('json')
        .messages({
            'any.only': 'Export format must be one of: json, csv, pdf'
        }),
    includeCharts: Joi.boolean().default(false)
        .messages({
            'boolean.base': 'Include charts must be a boolean value'
        })
});

/**
 * Schema for custom date range validation
 */
export const customDateRangeSchema = Joi.object({
    startDate: Joi.date().iso().required()
        .messages({
            'any.required': 'Start date is required',
            'date.base': 'Start date must be a valid date',
            'date.format': 'Start date must be in ISO format (YYYY-MM-DD)'
        }),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
        .messages({
            'any.required': 'End date is required',
            'date.base': 'End date must be a valid date',
            'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
            'date.min': 'End date must be after or equal to start date'
        }),
    timezone: Joi.string().optional()
        .messages({
            'string.base': 'Timezone must be a string'
        })
});

/**
 * Schema for report filters
 */
export const reportFiltersSchema = Joi.object({
    status: Joi.string().valid('active', 'inactive', 'all').default('all')
        .messages({
            'any.only': 'Status must be one of: active, inactive, all'
        }),
    priority: Joi.string().valid('high', 'medium', 'low', 'all').default('all')
        .messages({
            'any.only': 'Priority must be one of: high, medium, low, all'
        }),
    tags: Joi.array().items(Joi.string()).optional()
        .messages({
            'array.base': 'Tags must be an array',
            'array.items': 'Tags must contain only strings'
        })
});

/**
 * Schema for report sorting
 */
export const reportSortingSchema = Joi.object({
    sortBy: Joi.string().valid('date', 'count', 'name', 'category').default('date')
        .messages({
            'any.only': 'Sort by must be one of: date, count, name, category'
        }),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
        .messages({
            'any.only': 'Sort order must be one of: asc, desc'
        })
});
