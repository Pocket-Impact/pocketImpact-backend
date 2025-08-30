# Reports API - Pocket Impact

## Overview

The Reports API provides comprehensive analytics and reporting capabilities for organisations to gain insights into their surveys, responses, feedback, and user activities. This system is designed to help administrators and analysts make data-driven decisions with actionable insights.

## Features

- **Survey Reports**: Analytics on survey performance, response rates, and engagement
- **Response Reports**: Detailed analysis of survey responses and completion rates
- **Feedback Reports**: Insights into user feedback trends and sentiment analysis
- **User Activity Reports**: User engagement and role distribution analytics
- **Executive Summary**: High-level overview with actionable recommendations
- **Advanced Filtering**: Date ranges, categories, roles, and custom parameters
- **Real-time Analytics**: Live data aggregation and processing
- **Export Capabilities**: Multiple format support (JSON, CSV, PDF)

## Architecture & Best Practices

### 1. **Modular Design**
- **Separation of Concerns**: Controllers, routes, schemas, and utilities are clearly separated
- **Reusable Components**: Common database operations and response formatting utilities
- **Constants Management**: Centralized configuration and constants

### 2. **Error Handling**
- **Consistent Error Responses**: Standardized error format with timestamps
- **Proper HTTP Status Codes**: Appropriate status codes for different error types
- **Error Logging**: Comprehensive error logging for debugging

### 3. **Input Validation**
- **Joi Schemas**: Robust validation with custom error messages
- **Query Parameter Validation**: Comprehensive validation for all query parameters
- **Date Range Validation**: Intelligent date range handling and validation

### 4. **Database Optimization**
- **Aggregation Pipelines**: Efficient MongoDB aggregation for complex queries
- **Index Optimization**: Proper indexing for performance
- **Connection Pooling**: Optimized database connections

### 5. **Security**
- **Role-Based Access Control**: Different access levels for different user roles
- **Input Sanitization**: Protection against injection attacks
- **Authentication Middleware**: JWT-based authentication

## Quick Start

### 1. Authentication

All reports endpoints require JWT authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### 2. Basic Usage

#### Get Survey Reports
```bash
GET /api/reports/surveys
```

**Query Parameters:**
- `startDate` (optional): Start date in ISO format (YYYY-MM-DD)
- `endDate` (optional): End date in ISO format (YYYY-MM-DD)
- `surveyId` (optional): Specific survey ID to filter by

**Example:**
```bash
GET /api/reports/surveys?startDate=2024-01-01&endDate=2024-01-31
```

#### Get Response Analytics
```bash
GET /api/reports/responses?startDate=2024-01-01&endDate=2024-01-31
```

#### Get Feedback Analytics
```bash
GET /api/reports/feedback?category=product&startDate=2024-01-01&endDate=2024-01-31
```

#### Get User Activity Reports
```bash
GET /api/reports/users?role=analyst&startDate=2024-01-01&endDate=2024-01-31
```

#### Get Executive Summary
```bash
GET /api/reports/executive-summary?period=30
```

## API Endpoints

### 1. Survey Reports
**Endpoint:** `GET /api/reports/surveys`
**Access:** Admin, Analyst
**Description:** Comprehensive survey analytics including performance metrics, response rates, and top-performing surveys.

**Response Structure:**
```json
{
  "status": "success",
  "message": "Survey reports generated successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "summary": {
      "totalSurveys": 15,
      "activeSurveys": 12,
      "avgQuestions": 8.5,
      "totalQuestions": 127
    },
    "topSurveys": [
      {
        "_id": "survey123",
        "title": "Customer Satisfaction",
        "responseCount": 45,
        "completionRate": 85.5,
        "questionCount": 10,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "responseStats": [
      {
        "surveyId": "survey123",
        "responseCount": 45
      }
    ]
  }
}
```

### 2. Response Reports
**Endpoint:** `GET /api/reports/responses`
**Access:** Admin, Analyst
**Description:** Response analytics including trends over time, sentiment analysis, and completion rates.

**Response Structure:**
```json
{
  "status": "success",
  "message": "Response reports generated successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "responseTrends": [
      { "date": "2024-01-01", "count": 12 },
      { "date": "2024-01-02", "count": 18 }
    ],
    "sentimentAnalysis": [
      { "sentiment": "positive", "count": 25 },
      { "sentiment": "neutral", "count": 8 },
      { "sentiment": "negative", "count": 3 }
    ],
    "completionRates": [
      {
        "_id": "survey123",
        "title": "Customer Satisfaction",
        "responseCount": 45,
        "completionRate": 85.5,
        "questionCount": 10
      }
    ]
  }
}
```

### 3. Feedback Reports
**Endpoint:** `GET /api/reports/feedback`
**Access:** Admin, Analyst
**Description:** Feedback analytics including trends, category distribution, and sentiment analysis.

**Response Structure:**
```json
{
  "status": "success",
  "message": "Feedback reports generated successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "feedbackTrends": [
      { "date": "2024-01-01", "count": 5 },
      { "date": "2024-01-02", "count": 8 }
    ],
    "categoryDistribution": [
      {
        "category": "Product",
        "count": 15,
        "percentage": 35.7
      },
      {
        "category": "Support",
        "count": 12,
        "percentage": 28.6
      }
    ],
    "sentimentTrends": [
      {
        "_id": {
          "date": "2024-01-01",
          "sentiment": "positive"
        },
        "count": 8
      }
    ],
    "totalFeedbackCount": 42
  }
}
```

### 4. User Activity Reports
**Endpoint:** `GET /api/reports/users`
**Access:** Admin only
**Description:** User activity analytics including statistics, role distribution, and activity trends.

**Response Structure:**
```json
{
  "status": "success",
  "message": "User activity reports generated successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "userStats": {
      "totalUsers": 25,
      "verifiedUsers": 23,
      "activeUsers": 18,
      "verificationRate": 92.0,
      "activityRate": 72.0
    },
    "roleDistribution": [
      { "role": "analyst", "count": 12 },
      { "role": "researcher", "count": 8 },
      { "role": "admin", "count": 5 }
    ],
    "userActivity": [
      { "date": "2024-01-01", "newUsers": 3 },
      { "date": "2024-01-02", "newUsers": 1 }
    ]
  }
}
```

### 5. Executive Summary
**Endpoint:** `GET /api/reports/executive-summary`
**Access:** Admin only
**Description:** High-level overview with key metrics and actionable recommendations.

**Response Structure:**
```json
{
  "status": "success",
  "message": "Executive summary generated successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "period": "30 days",
    "keyMetrics": {
      "totalSurveys": 15,
      "totalResponses": 89,
      "totalFeedbacks": 23,
      "totalUsers": 25,
      "avgResponseRate": 85.5
    },
    "sentimentOverview": [
      { "sentiment": "positive", "count": 15 },
      { "sentiment": "neutral", "count": 6 },
      { "sentiment": "negative", "count": 2 }
    ],
    "topCategories": [
      { "category": "product", "count": 8 },
      { "category": "support", "count": 6 }
    ],
    "recommendations": [
      "Consider improving survey engagement strategies to increase response rates",
      "Focus on addressing negative feedback to improve overall satisfaction"
    ]
  }
}
```

## Query Parameters

### Date Range Parameters
- **startDate**: Start date in ISO format (YYYY-MM-DD)
- **endDate**: End date in ISO format (YYYY-MM-DD)
- **Note**: Both dates must be provided together or neither

### Filter Parameters
- **surveyId**: Specific survey ID (24-character hexadecimal)
- **category**: Feedback category (product, ux, support, pricing, features, performance, other)
- **role**: User role (admin, analyst, researcher)
- **period**: Number of days for executive summary (1-365, default: 30)

### Validation Rules
- **Date Format**: Must be valid ISO date format
- **Date Logic**: endDate must be >= startDate
- **Period Limits**: 1-365 days for executive summary
- **ObjectId Validation**: Survey IDs must be valid MongoDB ObjectIds

## Error Handling

### Error Response Format
```json
{
  "status": "error",
  "message": "Descriptive error message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "errorCode": "ERROR_CODE"
}
```

### Common Error Codes
- `INVALID_DATE_RANGE`: Date validation failed
- `INVALID_ORGANISATION_ID`: Organisation ID is missing or invalid
- `INSUFFICIENT_PERMISSIONS`: User lacks required role
- `DATABASE_ERROR`: Database operation failed
- `VALIDATION_ERROR`: Input validation failed

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `500`: Internal Server Error

## Performance Considerations

### 1. **Database Optimization**
- Use appropriate indexes on frequently queried fields
- Implement pagination for large datasets
- Use aggregation pipelines efficiently

### 2. **Caching Strategy**
- Implement Redis caching for frequently accessed reports
- Cache aggregation results for better performance
- Set appropriate TTL for cached data

### 3. **Query Optimization**
- Limit date ranges to reasonable periods
- Use projection to select only needed fields
- Implement result limiting for large datasets

## Security Features

### 1. **Authentication**
- JWT-based authentication required for all endpoints
- Token validation on every request
- Automatic token refresh handling

### 2. **Authorization**
- Role-based access control (RBAC)
- Different permission levels for different user roles
- Organisation-level data isolation

### 3. **Input Validation**
- Comprehensive input sanitization
- SQL injection prevention
- XSS protection through proper escaping

## Testing

### Running Tests
```bash
npm test -- reportsController.test.js
```

### Test Coverage
- Unit tests for all controller functions
- Mock testing for database operations
- Error handling validation
- Input validation testing
- Edge case coverage

## Monitoring & Logging

### 1. **Performance Monitoring**
- Response time tracking
- Database query performance
- Error rate monitoring

### 2. **Logging**
- Request/response logging
- Error logging with stack traces
- Performance metrics logging

### 3. **Health Checks**
- Database connectivity monitoring
- Service health endpoint
- Dependency status checking

## Deployment Considerations

### 1. **Environment Variables**
```bash
NODE_ENV=production
DATABASE_URL=mongodb://your-database-url
ACCESS_TOKEN_SECRET=your-secret
REFRESH_TOKEN_SECRET=your-refresh-secret
```

### 2. **Database Setup**
- Ensure proper indexes are created
- Set up connection pooling
- Configure read replicas if needed

### 3. **Monitoring Setup**
- Set up application performance monitoring
- Configure error tracking
- Set up health check endpoints

## Contributing

### Code Style
- Follow ESLint configuration
- Use consistent naming conventions
- Add JSDoc comments for functions
- Write comprehensive tests

### Pull Request Process
1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Code review and approval

## Support

For questions or issues:
- Check the API documentation
- Review error logs
- Contact the development team
- Submit GitHub issues

## License

This project is licensed under the MIT License - see the LICENSE file for details.
