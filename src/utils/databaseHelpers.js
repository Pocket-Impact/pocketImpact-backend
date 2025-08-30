import mongoose from 'mongoose';

/**
 * Convert string to ObjectId safely
 * @param {string} id - String ID to convert
 * @returns {mongoose.Types.ObjectId|null} - ObjectId or null if invalid
 */
export const toObjectId = (id) => {
    try {
        return new mongoose.Types.ObjectId(id);
    } catch (error) {
        return null;
    }
};

/**
 * Create date range filter for MongoDB queries
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 * @returns {Object} - Date filter object for MongoDB
 */
export const createDateFilter = (startDate, endDate) => {
    if (!startDate || !endDate) return {};
    
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Invalid date format');
        }
        
        if (start > end) {
            throw new Error('Start date must be before end date');
        }
        
        return {
            createdAt: {
                $gte: start,
                $lte: end
            }
        };
    } catch (error) {
        throw new Error(`Invalid date range: ${error.message}`);
    }
};

/**
 * Create organisation filter for MongoDB queries
 * @param {string} organisationId - Organisation ID
 * @returns {Object} - Organisation filter object
 */
export const createOrganisationFilter = (organisationId) => {
    if (!organisationId) {
        throw new Error('Organisation ID is required');
    }
    
    const objectId = toObjectId(organisationId);
    if (!objectId) {
        throw new Error('Invalid organisation ID format');
    }
    
    return { organisationId: objectId };
};

/**
 * Format aggregation results with consistent structure
 * @param {Array} results - Raw aggregation results
 * @param {string} keyField - Field to use as key
 * @param {string} valueField - Field to use as value
 * @returns {Array} - Formatted results
 */
export const formatAggregationResults = (results, keyField = '_id', valueField = 'count') => {
    return results.map(item => ({
        [keyField]: item[keyField],
        [valueField]: item[valueField]
    }));
};

/**
 * Calculate percentage from count and total
 * @param {number} count - Individual count
 * @param {number} total - Total count
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {number} - Percentage value
 */
export const calculatePercentage = (count, total, decimals = 1) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100 * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Create pagination parameters
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Object} - Pagination object with skip and limit
 */
export const createPagination = (page = 1, limit = 10) => {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    
    return {
        skip: (pageNum - 1) * limitNum,
        limit: limitNum,
        page: pageNum
    };
};

/**
 * Validate and sanitize query parameters
 * @param {Object} query - Query parameters
 * @param {Array} allowedFields - Allowed field names
 * @returns {Object} - Sanitized query object
 */
export const sanitizeQuery = (query, allowedFields) => {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(query)) {
        if (allowedFields.includes(key) && value !== undefined && value !== '') {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
};

/**
 * Create error response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} errorCode - Custom error code
 * @returns {Object} - Standardized error response
 */
export const createErrorResponse = (message, statusCode = 500, errorCode = null) => {
    const response = {
        status: 'error',
        message,
        timestamp: new Date().toISOString()
    };
    
    if (errorCode) {
        response.errorCode = errorCode;
    }
    
    return { response, statusCode };
};

/**
 * Create success response object
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Standardized success response
 */
export const createSuccessResponse = (message, data = null, statusCode = 200) => {
    const response = {
        status: 'success',
        message,
        timestamp: new Date().toISOString()
    };
    
    if (data !== null) {
        response.data = data;
    }
    
    return { response, statusCode };
};
