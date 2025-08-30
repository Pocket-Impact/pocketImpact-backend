/**
 * Report-related constants
 */

// Date formats
export const DATE_FORMATS = {
    ISO: 'YYYY-MM-DD',
    DISPLAY: 'MMM DD, YYYY',
    DATETIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
};

// Time periods
export const TIME_PERIODS = {
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    QUARTER: 'quarter',
    YEAR: 'year'
};

// Default values
export const DEFAULTS = {
    PERIOD_DAYS: 30,
    MAX_PERIOD_DAYS: 365,
    MIN_PERIOD_DAYS: 1,
    PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100
};

// Chart colors
export const CHART_COLORS = {
    POSITIVE: '#47b89b',
    NEGATIVE: '#d25871',
    NEUTRAL: '#EFB100',
    PRIMARY: '#2D4C35',
    SECONDARY: '#9ae6b4',
    ACCENT: '#FF6900'
};

// Sentiment types
export const SENTIMENT_TYPES = {
    POSITIVE: 'positive',
    NEGATIVE: 'negative',
    NEUTRAL: 'neutral'
};

// Feedback categories
export const FEEDBACK_CATEGORIES = [
    'product',
    'ux',
    'support',
    'pricing',
    'features',
    'performance',
    'other'
];

// User roles
export const USER_ROLES = {
    ADMIN: 'admin',
    ANALYST: 'analyst',
    RESEARCHER: 'researcher'
};

// User roles array for validation
export const USER_ROLES_ARRAY = ['admin', 'analyst', 'researcher'];

// Report types
export const REPORT_TYPES = {
    SURVEY: 'survey',
    RESPONSE: 'response',
    FEEDBACK: 'feedback',
    USER: 'user',
    EXECUTIVE: 'executive'
};

// Error codes
export const ERROR_CODES = {
    INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
    INVALID_ORGANISATION_ID: 'INVALID_ORGANISATION_ID',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    DATABASE_ERROR: 'DATABASE_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR'
};

// Success messages
export const SUCCESS_MESSAGES = {
    SURVEY_REPORTS: 'Survey reports generated successfully',
    RESPONSE_REPORTS: 'Response reports generated successfully',
    FEEDBACK_REPORTS: 'Feedback reports generated successfully',
    USER_REPORTS: 'User activity reports generated successfully',
    EXECUTIVE_SUMMARY: 'Executive summary generated successfully'
};

// Error messages
export const ERROR_MESSAGES = {
    ORGANISATION_REQUIRED: 'Organisation ID is required',
    INVALID_DATE_FORMAT: 'Invalid date format provided',
    INVALID_PERIOD: 'Invalid period specified',
    UNAUTHORIZED_ACCESS: 'Unauthorized access to this report',
    FAILED_TO_GENERATE: 'Failed to generate report'
};
