# Pocket Impact Backend API Documentation

## Overview

Pocket Impact is a Node.js/Express REST API for managing users, organisations, surveys, responses, and feedback with authentication and role-based access control. It uses MongoDB for data storage and includes sentiment analysis capabilities.

---

## Table of Contents

1. **Authentication**
2. **User Management**
3. **Survey Management**
4. **Response Management**
5. **Feedback Management**
6. **Middleware**
7. **Models & Enums**
8. **Dashboard**
9. **Reports** ⭐ *Updated with Comprehensive Analytics*
10. **Utilities**
11. **Database Connection**
12. **CORS & Cookie Configuration**
13. **Rate Limiting & Security**
14. **Error Handling**
15. **Deployment Considerations**

---

## 1. Authentication

### Signup – `POST /api/auth/signup` – `201 Created`
**Auth:** No  
**Description:** Register a new organisation and admin user. Sends an OTP to the provided email for verification.  
**Request Body:**  
```json
{
  "fullname": "Jane Doe",
  "email": "jane@example.com",
  "phonenumber": "+1234567890",
  "organisationName": "Acme Corp",
  "organisationCountry": "USA",
  "organisationSize": "medium",
  "password": "securePassword123"
}
```
**Success Response:**  
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "userId",
      "fullname": "Jane Doe",
      "email": "jane@example.com",
      "role": "admin"
    }
  }
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "All fields are required"
}
```
**Status Codes:** `201 Created`, `400 Bad Request`, `500 Internal Server Error`

### Login – `POST /api/auth/login` – `200 OK`
**Auth:** No  
**Description:** Login with email and password. Returns access and refresh tokens as HTTP-only cookies.  
**Request Body:**  
```json
{
  "email": "jane@example.com",
  "password": "securePassword123"
}
```
**Success Response:**  
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "userId",
      "fullname": "Jane Doe",
      "email": "jane@example.com",
      "role": "admin",
      "isVerified": true,
      "organisationName": "Acme Corp",
      "organisationId": "orgId"
    }
  }
}
```
**Cookies Set:**
- `accessToken`: JWT access token (1 hour expiry, HTTP-only)
- `refreshToken`: JWT refresh token (7 days expiry, HTTP-only)

**Error Response:**  
```json
{
  "status": "fail",
  "message": "Email and password are required"
}
```
**Status Codes:** `200 OK`, `400 Bad Request`, `401 Unauthorized`

**Note:** Cookies are automatically sent with subsequent requests when using `credentials: 'include'` in frontend requests.

### Refresh Token – `POST /api/auth/refresh-token` – `200 OK`
**Auth:** No (requires valid refresh token cookie)  
**Description:** Use a valid refresh token from cookies to obtain a new access token.  
**Cookies Required:** `refreshToken` (automatically sent with request)  
**Request Body:** None required (token is read from cookies)

**Success Response:**  
```json
{
  "status": "success",
  "message": "Token refreshed"
}
```
**Cookies Updated:**
- `accessToken`: New JWT access token (15 minutes expiry, HTTP-only)

**Error Response:**  
```json
{
  "status": "fail",
  "message": "Refresh token missing"
}
```
**Status Codes:** `200 OK`, `401 Unauthorized`, `403 Forbidden`

**Note:** This endpoint automatically reads the refresh token from cookies. No need to send it in the request body.

### Verify OTP – `POST /api/auth/verify-otp` – `200 OK`
**Auth:** Yes (JWT required)  
**Description:** Verify the OTP sent to the user's email.  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Request Body:**  
```json
{
  "email": "jane@example.com",
  "otp": "123456"
}
```
**Success Response:**  
```json
{
  "status": "success",
  "message": "Account verified successfully",
  "data": {
    "user": {
      "id": "userId",
      "email": "jane@example.com",
      "isVerified": true
    }
  }
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "Invalid OTP"
}
```
**Status Codes:** `200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`

### Resend OTP – `GET /api/auth/resend-otp` – `200 OK`
**Auth:** Yes (JWT required)  
**Description:** Resend a new OTP to the user's email.  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Success Response:**  
```json
{
  "status": "success",
  "message": "New OTP sent to your email",
  "data": {
    "email": "jane@example.com"
  }
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "User not found"
}
```
**Status Codes:** `200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`

### Forgot Password – `POST /api/auth/forgot-password` – `200 OK`
**Auth:** No  
**Description:** Request a password reset link.  
**Request Body:**  
```json
{
  "email": "jane@example.com"
}
```
**Success Response:**  
```json
{
  "status": "success",
  "message": "Password reset link sent to your email."
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "No account found with that email address."
}
```
**Status Codes:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

### Reset Password – `POST /api/auth/reset-password` – `200 OK`
**Auth:** No  
**Description:** Reset password using the token sent to email.  
**Request Body:**  
```json
{
  "token": "abcdef123456",
  "newPassword": "newSecurePassword456"
}
```
**Success Response:**  
```json
{
  "status": "success",
  "message": "Password has been reset successfully."
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "Invalid or expired password reset token."
}
```
**Status Codes:** `200 OK`, `400 Bad Request`, `500 Internal Server Error`

### Check Authenticated User – `GET /api/auth/check` – `200 OK`
**Auth:** Yes (JWT required)  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Description:** Returns the currently authenticated user's info if the access token is valid.  
**Success Response:**  
```json
{
  "status": "success",
  "user": {
    "id": "userId",
    "role": "admin",
    "organisation": "organisationId"
  }
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "Unauthorized access"
}
```
**Status Codes:** `200 OK`, `401 Unauthorized`

### Logout – `GET /api/auth/logout` – `200 OK`
**Auth:** No  
**Description:** Log out the current user by clearing JWT cookies.  
**Success Response:**  
```json
{
  "status": "success",
  "message": "Logout successful"
}
```
**Cookies Cleared:**
- `accessToken`: Removed
- `refreshToken`: Removed

**Status Codes:** `200 OK`

**Note:** This endpoint clears both access and refresh token cookies, effectively logging the user out.

---

### Authentication Flow

The API uses a cookie-based authentication system with automatic token refresh:

1. **Login** → Sets `accessToken` (1 hour) and `refreshToken` (7 days) as HTTP-only cookies
2. **API Requests** → Include `Authorization: Bearer <token>` header (token from cookies)
3. **Token Refresh** → Automatically refresh access token using refresh token cookie
4. **Logout** → Clear both cookies

**Frontend Implementation:**
```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Protected API calls
const data = await fetch('/api/users/profile', {
  credentials: 'include', // Required for cookies
  headers: { 'Content-Type': 'application/json' }
});

// Logout
await fetch('/api/auth/logout', {
  method: 'GET',
  credentials: 'include'
});
```

**Token Expiry Handling:**
- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Use `/api/auth/refresh-token` to get new access token
- Frontend should handle 401 responses by attempting token refresh

---

## 2. User Management

### Add User to Organisation – `POST /api/users/add-user` – `201 Created`
**Auth:** Yes (JWT required)  
**Role:** Admin only  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Description:** Add a user to the current organisation. Sends a randomly generated password to the user's email.  
**Request Body:**  
```json
{
  "fullname": "John Smith",
  "phonenumber": "+1234567890",
  "email": "john@example.com",
  "role": "analyst" // enum: admin, analyst, researcher
}
```
**Success Response:**  
```json
{
  "status": "success",
  "message": "A verification code was sent to john@example.com. Please check your inbox before it expires.",
  "data": {
    "user": {
      "id": "userId",
      "fullname": "John Smith",
      "email": "john@example.com",
      "role": "analyst"
    }
  }
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "Email already exists"
}
```
**Status Codes:** `201 Created`, `400 Bad Request`, `500 Internal Server Error`

### Get All Users in Organisation – `GET /api/users/all-users` – `200 OK`
**Auth:** Yes (JWT required)  
**Role:** Admin only  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Description:** Get all users in the current organisation with their organisation details populated.  
**Success Response:**  
```json
{
  "status": "success",
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "_id": "userId",
        "fullname": "John Smith",
        "email": "john@example.com",
        "phonenumber": "+1234567890",
        "role": "analyst",
        "organisationId": "org123",
        "organisation": {
          "organisationName": "Acme Corp",
          "organisationCountry": "USA",
          "organisationSize": "100-500"
        },
        "isVerified": true,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ]
  }
}
```
**Status Codes:** `200 OK`, `500 Internal Server Error`

### Update User – `PUT /api/users/update-user` – `200 OK`
**Auth:** Yes (JWT required)  
**Role:** Admin only  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Description:** Update user details in the organisation.  
**Request Body:**  
```json
{
  "userId": "userId",
  "fullname": "John Smith Updated",
  "phonenumber": "+1234567890",
  "email": "john.updated@example.com",
  "role": "researcher"
}
```
**Success Response:**  
```json
{
  "status": "success",
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": "userId",
      "fullname": "John Smith Updated",
      "email": "john.updated@example.com",
      "role": "researcher"
    }
  }
}
```
**Status Codes:** `200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`

### Delete User – `DELETE /api/users/delete-user/:id` – `200 OK`
**Auth:** Yes (JWT required)  
**Role:** Admin only  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Description:** Delete a user from the organisation by ID.  
**Success Response:**  
```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "User not found"
}
```
**Status Codes:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

---

## 3. Survey Management

### Create Survey – `POST /api/surveys` – `201 Created`
**Auth:** Yes (JWT required)  
**Role:** Admin, Analyst  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Description:** Create a new survey for the authenticated user's organisation. The organisation is automatically set from the user's session; you do not need to provide it in the request body.  
**Request Body:**  
```json
{
  "title": "Customer Satisfaction Survey",
  "description": "Monthly response survey",
  "questions": [
    {
      "questionText": "How satisfied are you with our service?",
      "type": "rating" // enum: rating, text, multiple-choice
    },
    {
      "questionText": "What can we improve?",
      "type": "text"
    }
  ]
}
```
**Success Response:**  
```json
{
  "status": "success",
  "message": "Survey created successfully.",
  "data": {
    "survey": {
      "id": "surveyId",
      "title": "Customer Satisfaction Survey",
      "description": "Monthly response survey",
      "questions": [ ... ]
    }
  }
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "Title, questions, organisation, and createdBy are required."
}
```
**Status Codes:** `201 Created`, `400 Bad Request`, `500 Internal Server Error`

### Get Surveys by Organisation – `GET /api/surveys` – `200 OK`
**Auth:** Yes (JWT required)  
**Role:** Admin, Analyst, Researcher  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Description:** Get all surveys for the current organisation.  
**Success Response:**  
```json
{
  "status": "success",
  "data": [
    {
      "id": "surveyId",
      "title": "Customer Satisfaction Survey",
      "description": "Monthly response survey",
      "questions": [ ... ]
    }
  ]
}
```
**Status Codes:** `200 OK`, `500 Internal Server Error`

### Update Survey – `PUT /api/surveys/:surveyId` – `200 OK`
**Auth:** Yes (JWT required)  
**Role:** Admin, Analyst  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Description:** Update a survey by ID.  
**Request Body:** `title`, `description`, `questions`  
**Success Response:**  
```json
{
  "status": "success",
  "message": "Survey updated successfully",
  "data": {
    "survey": { ... }
  }
}
```
**Status Codes:** `200 OK`, `400 Bad Request`, `500 Internal Server Error`

### Delete Survey – `DELETE /api/surveys/:surveyId` – `200 OK`
**Auth:** Yes (JWT required)  
**Role:** Admin, Analyst  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Description:** Delete a survey by ID.  
**Success Response:**  
```json
{
  "status": "success",
  "message": "Survey deleted successfully"
}
```
**Status Codes:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

### Send Survey Link – `POST /api/surveys/send-survey-link` – `200 OK`
**Auth:** Yes (JWT required)  
**Role:** Admin, Analyst  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Description:** Send survey link via email to multiple recipients.  
**Request Body:**  
```json
{
  "surveyId": "surveyId",
  "emails": ["user1@example.com", "user2@example.com"]
}
```
**Success Response:**  
```json
{
  "status": "success",
  "message": "Survey links sent successfully"
}
```
**Status Codes:** `200 OK`, `400 Bad Request`, `500 Internal Server Error`

### Get Survey by Unique Link – `GET /api/surveys/unique/:uniqueLinkId` – `200 OK`
**Auth:** No  
**Description:** Get a survey by its unique link ID.  
**Success Response:**  
```json
{
  "status": "success",
  "data": {
    "survey": { ... }
  }
}
```
**Status Codes:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

---

## 4. Response Management

### Submit Response – `POST /api/responses` – `201 Created`
**Auth:** No  
**Description:** Submit responses for a survey. Each answer is analyzed for sentiment (positive, negative, neutral) and the result is stored with the response.  
**Request Body:**  
```json
{
  "surveyId": "survey123",
  "responses": [
    { "questionId": "q1", "answer": "Very satisfied" },
    { "questionId": "q2", "answer": "More vegan options" }
  ]
}
```
**Success Response:**  
```json
{
  "status": "success",
  "message": "Response submitted successfully.",
  "data": {
    "response": {
      "id": "responseId",
      "survey": "survey123",
      "responses": [
        {
          "questionId": "q1",
          "answer": "Very satisfied",
          "sentiment": "positive"
        },
        {
          "questionId": "q2",
          "answer": "More vegan options",
          "sentiment": "neutral"
        }
      ]
    }
  }
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "Survey ID and responses are required."
}
```
**Status Codes:** `201 Created`, `400 Bad Request`, `500 Internal Server Error`

### Get Responses by Survey – `GET /api/responses/survey/:surveyId` – `200 OK`
**Auth:** Yes (JWT required)  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Description:** Get all responses for a specific survey, including sentiment analysis for each answer and question details.  
**Success Response:**  
```json
{
  "status": "success",
  "data": [
    {
      "_id": "responseId",
      "surveyId": "survey123",
      "responses": [
        {
          "questionId": "q1",
          "answer": "Very satisfied",
          "sentiment": "positive",
          "questionText": "How satisfied are you with our service?",
          "options": []
        }
        // ...
      ],
      "createdAt": "2025-08-12T14:09:07.000Z",
      "updatedAt": "2025-08-12T14:09:07.000Z"
    }
  ]
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "No responses found for this survey."
}
```
**Status Codes:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

### Get Responses by Organisation – `GET /api/responses/organisation/` – `200 OK`
**Auth:** Yes (JWT required)  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Description:** Get all general responses for the current organisation.  
**Success Response:**  
```json
{
  "status": "success",
  "message": "Responses fetched successfully.",
  "data": [
    {
      "_id": "responseId",
      "organisationId": "org123",
      "message": "Great product, but could be faster!",
      "category": "performance",
      "sentiment": "neutral",
      "createdAt": "2025-08-18T19:32:36.000Z"
    }
    // ...
  ]
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "No responses found for this organisation."
}
```
**Status Codes:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

---

## 5. Feedback Management

### Submit Feedback – `POST /api/feedbacks` – `201 Created`
**Auth:** No  
**Description:** Submit general feedback for an organisation (not tied to a survey). Response can be categorized and optionally analyzed for sentiment.  
**Request Body:**  
```json
{
  "organisationId": "org123",
  "message": "Great product, but could be faster!",
  "category": "performance"
}
```
**Success Response:**  
```json
{
  "status": "success",
  "message": "Feedback submitted successfully.",
  "data": {
    "_id": "feedbackId",
    "organisationId": "org123",
    "message": "Great product, but could be faster!",
    "category": "performance",
    "sentiment": null,
    "createdAt": "2025-08-18T19:32:36.000Z"
  }
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "Organisation and message are required."
}
```
**Status Codes:** `201 Created`, `400 Bad Request`, `500 Internal Server Error`

### Get Feedback by Organisation – `GET /api/feedbacks` – `200 OK`
**Auth:** Yes (JWT required)  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Description:** Get all feedback for the current organisation.  
**Success Response:**  
```json
{
  "status": "success",
  "message": "Feedback fetched successfully.",
  "data": [
    {
      "_id": "feedbackId",
      "organisationId": "org123",
      "message": "Great product, but could be faster!",
      "category": "performance",
      "sentiment": "neutral",
      "createdAt": "2025-08-18T19:32:36.000Z"
    }
    // ...
  ]
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "No feedback found for this organisation."
}
```
**Status Codes:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

### Delete Feedback – `DELETE /api/feedbacks/:id` – `200 OK`
**Auth:** Yes (JWT required)  
**Role:** Admin only  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Description:** Delete a feedback entry by its ID.  
**Success Response:**  
```json
{
  "status": "success",
  "message": "Feedback deleted successfully."
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "Feedback not found."
}
```
**Status Codes:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

### Analyze Feedback Sentiment – `POST /api/feedbacks/analyze-sentiment` – `200 OK`
**Auth:** Yes (JWT required)  
**Role:** Admin only  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Description:** Analyze sentiment for all unprocessed feedback entries in the organisation.  
**Success Response:**  
```json
{
  "status": "success",
  "message": "Sentiment analysis completed",
  "data": {
    "processedCount": 5,
    "results": [
      {
        "feedbackId": "feedbackId",
        "sentiment": "positive"
      }
    ]
  }
}
```
**Status Codes:** `200 OK`, `500 Internal Server Error`

---

## 6. Middleware

- **protect:** Checks for JWT in cookies, verifies token, attaches user info to `req.user`.
- **restrictTo(...roles):** Restricts access to users with specified roles.

  **Example:**
  ```js
  router.get('/admin-data', protect, restrictTo('admin'), controller);
  ```

- **requireVerifiedUser:** Ensures the user is verified before allowing access to certain routes.
- **validate(schema):** Validates request body against Joi schemas.

---

## 7. Models & Enums

### User
- `fullname` (string, required)
- `email` (string, required, unique, validated)
- `phonenumber` (string, required, validated, E.164 format)
- `organisationId` (ObjectId, ref: Organisation, required)
- `role` (enum: 'admin', 'analyst', 'researcher', required)
- `password` (string, required, hashed, minlength: 6)
- `isVerified` (boolean, default: false)
- `otp` (string)
- `otpExpires` (Date)
- `resetPasswordToken` (string)
- `resetPasswordExpires` (Date)
- `organisation` (virtual field, populated with Organisation details)

### Organisation
- `organisationName` (string, required, unique)
- `organisationCountry` (string, required)
- `organisationSize` (enum: 'small', 'medium', 'large', required)

### Survey
- `title` (string, required)
- `description` (string, optional)
- `questions` (array of objects, required)
  - `questionText` (string, required)
  - `type` (enum: 'rating', 'text', 'multiple-choice', required)
- `uniqueLinkId` (string, required, unique)
- `organisation` (ObjectId, ref: Organisation, required)
- `createdBy` (ObjectId, ref: User, required)

### Response
- `survey` (ObjectId, ref: Survey, required)
- `responses` (array of objects, required)
  - `questionId` (ObjectId or string, required)
  - `answer` (string, required)
  - `sentiment` (string, enum: 'positive', 'negative', 'neutral', default: 'neutral')

### Feedback
- `organisationId` (ObjectId, ref: Organisation, required)
- `message` (string, required)
- `category` (string, enum: 'product', 'ux', 'support', 'pricing', 'features', 'performance', 'other', default: 'other')
- `sentiment` (string, enum: 'positive', 'negative', 'neutral', default: null)
- `createdAt` (Date)

### Enums
- **User Roles:**
  - `admin`
  - `analyst`
  - `researcher`
- **Organisation Size:**
  - `small`
  - `medium`
  - `large`
- **Survey Question Types:**
  - `rating`
  - `text`
  - `multiple-choice`
- **Feedback Categories:**
  - `product`
  - `ux`
  - `support`
  - `pricing`
  - `features`
  - `performance`
  - `other`

---

## 8. Dashboard

### Get Dashboard Analytics

**Endpoint:** `GET /api/dashboard`

**Description:** Retrieves comprehensive analytics data for the dashboard including totals, daily feedback trends, sentiment analysis, top topics, and recent feedbacks.

**Auth:** Yes (JWT required)
**Headers:**
```http
Authorization: Bearer <token>
```

**Note:** The organisation ID is automatically retrieved from the authenticated user's session.

**Response Format:**
```json
{
  "status": "success",
  "data": {
    "totals": {
      "surveys": 15,
      "surveysGrowthPercentage": 12,
      "responses": 89,
      "responsesGrowthPercentage": -5,
      "feedbacks": 23
    },
    "dailyFeedbacks": [
      { "day": "Mon", "Feedbacks": 2, "GrowthPercentage": 0 },
      { "day": "Tue", "Feedbacks": 5, "GrowthPercentage": 150 },
      { "day": "Wed", "Feedbacks": 3, "GrowthPercentage": -40 },
      { "day": "Thu", "Feedbacks": 7, "GrowthPercentage": 133 },
      { "day": "Fri", "Feedbacks": 4, "GrowthPercentage": -43 },
      { "day": "Sat", "Feedbacks": 6, "GrowthPercentage": 50 },
      { "day": "Sun", "Feedbacks": 1, "GrowthPercentage": -83 }
    ],
    "sentimentAnalysis": [
      { "name": "Positive", "value": 2, "color": "#7CCF00" },
      { "name": "Negative", "value": 3, "color": "#FF6900" },
      { "name": "Neutral", "value": 6, "color": "#EFB100" }
    ],
    "topTopics": [
      { "category": "Product", "count": 12, "percentage": 35, "feedbacks": 12 },
      { "category": "Support", "count": 9, "percentage": 26, "feedbacks": 9 },
      { "category": "Ux", "count": 6, "percentage": 17, "feedbacks": 6 },
      { "category": "Features", "count": 4, "percentage": 13, "feedbacks": 4 },
      { "category": "Performance", "count": 3, "percentage": 9, "feedbacks": 3 }
    ],
    "recentFeedbacks": [
      {
        "message": "Great user experience!",
        "category": "Ux",
        "sentiment": "Positive",
        "date": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Failed to fetch dashboard data",
  "error": "Error details"
}
```

---

## 9. Reports

The Reports API provides comprehensive analytics and reporting capabilities for organisations to gain insights into their surveys, responses, feedback, and user activities.

### 🎯 **Quick Start - Comprehensive Reports**

For complete analytics in one call, use the **Comprehensive Reports** endpoint:

```bash
GET /api/reports/comprehensive?startDate=2024-01-01&endDate=2024-01-31
```

This single endpoint provides:
- **KPIs**: Engagement, growth, and quality metrics
- **Survey Analytics**: Creation trends, question types, performance
- **Response Analytics**: Trends, completion rates, sentiment analysis
- **Feedback Analytics**: Category distribution, sentiment trends
- **User Analytics**: Activity, role distribution, engagement
- **Trending Categories**: Growth rates and trend analysis
- **Smart Insights**: AI-generated recommendations and insights

### 📊 **Available Endpoints**

1. **`/comprehensive`** ⭐ - Complete analytics dashboard (NEW)
2. **`/surveys`** - Detailed survey analytics
3. **`/responses`** - Response trends and analysis
4. **`/feedback`** - Feedback category and sentiment analysis
5. **`/users`** - User activity and engagement (Admin only)
6. **`/executive-summary`** - High-level KPIs and recommendations (Admin only)
7. **`/health`** - Service health check

### Get Comprehensive Reports – `GET /api/reports/comprehensive` – `200 OK` ⭐ **NEW**
**Auth:** Yes (JWT required)  
**Role:** Admin, Analyst  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Query Parameters:**  
- `startDate` (required): Start date for filtering (ISO format: YYYY-MM-DD)
- `endDate` (required): End date for filtering (ISO format: YYYY-MM-DD)

**Description:** Get comprehensive analytics for a specific date range including surveys, responses, feedback, users, trending categories, and actionable insights. This endpoint provides everything you need in one call for complete period analysis.  
**Success Response:**  
```json
{
  "status": "success",
  "message": "Comprehensive reports generated successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31",
      "duration": 31
    },
    "kpis": {
      "engagement": {
        "responseRate": 85.5,
        "completionRate": 78.2,
        "feedbackRate": 92.0
      },
      "growth": {
        "surveyGrowth": 15,
        "responseGrowth": 120,
        "feedbackGrowth": 45,
        "userGrowth": 8
      },
      "quality": {
        "avgQuestionsPerSurvey": 5.2,
        "avgResponseTime": 2.3,
        "sentimentScore": 0.3,
        "userVerificationRate": 95.0
      }
    },
    "surveyAnalytics": {
      "summary": {
        "totalSurveys": 15,
        "activeSurveys": 12,
        "avgQuestions": 5.2,
        "totalQuestions": 78
      },
      "trends": [
        { "date": "2024-01-01", "count": 2 },
        { "date": "2024-01-02", "count": 3 }
      ],
      "questionTypes": [
        { "type": "text", "count": 45 },
        { "type": "rating", "count": 23 },
        { "type": "choice", "count": 10 }
      ]
    },
    "responseAnalytics": {
      "summary": {
        "totalResponses": 120,
        "avgResponseTime": 2.3,
        "totalAnswers": 456
      },
      "trends": [
        { "date": "2024-01-01", "count": 8 },
        { "date": "2024-01-02", "count": 12 }
      ],
      "completionRates": [
        {
          "_id": "survey123",
          "title": "Customer Satisfaction",
          "responseCount": 45,
          "completionRate": 85.5,
          "questionCount": 5
        }
      ],
      "sentimentAnalysis": [
        { "sentiment": "positive", "count": 65 },
        { "sentiment": "neutral", "count": 35 },
        { "sentiment": "negative", "count": 20 }
      ]
    },
    "feedbackAnalytics": {
      "summary": {
        "totalFeedbacks": 45,
        "avgSentimentScore": 0.3
      },
      "trends": [
        { "date": "2024-01-01", "count": 3 },
        { "date": "2024-01-02", "count": 5 }
      ],
      "categoryDistribution": [
        {
          "category": "Product",
          "count": 15,
          "percentage": 33.3
        },
        {
          "category": "Support",
          "count": 12,
          "percentage": 26.7
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
      ]
    },
    "userAnalytics": {
      "summary": {
        "totalUsers": 25,
        "verifiedUsers": 23,
        "activeUsers": 18,
        "verificationRate": 92.0,
        "activityRate": 72.0
      },
      "activity": [
        { "date": "2024-01-01", "newUsers": 2 },
        { "date": "2024-01-02", "newUsers": 1 }
      ],
      "roleDistribution": [
        { "role": "analyst", "count": 12 },
        { "role": "researcher", "count": 8 },
        { "role": "admin", "count": 5 }
      ]
    },
    "trendingCategories": [
      {
        "category": "Product",
        "currentCount": 15,
        "previousCount": 10,
        "growthRate": 50.0,
        "trend": "rising"
      },
      {
        "category": "Support",
        "currentCount": 12,
        "previousCount": 15,
        "growthRate": -20.0,
        "trend": "falling"
      }
    ],
    "sentimentOverview": [
      { "sentiment": "positive", "count": 85 },
      { "sentiment": "neutral", "count": 45 },
      { "sentiment": "negative", "count": 25 }
    ],
    "topPerformingSurveys": [
      {
        "_id": "survey123",
        "title": "Customer Satisfaction",
        "description": "Monthly satisfaction survey",
        "responseCount": 45,
        "completionRate": 85.5,
        "questionCount": 5,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "insights": [
      {
        "type": "survey",
        "title": "Survey Activity",
        "message": "15 surveys created with an average of 5 questions each",
        "priority": "info"
      },
      {
        "type": "trending",
        "title": "Rising Trend",
        "message": "Product feedback is trending up with 50% growth",
        "priority": "success"
      },
      {
        "type": "sentiment",
        "title": "Positive Sentiment",
        "message": "Overall sentiment is positive with more positive than negative feedback",
        "priority": "success"
      }
    ]
  }
}
```

### Get Survey Reports – `GET /api/reports/surveys` – `200 OK`
**Auth:** Yes (JWT required)  
**Role:** Admin, Analyst  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Query Parameters:**  
- `startDate` (optional): Start date for filtering (ISO format: YYYY-MM-DD)
- `endDate` (optional): End date for filtering (ISO format: YYYY-MM-DD)
- `surveyId` (optional): Specific survey ID to filter by

**Description:** Get comprehensive survey analytics including total counts, active surveys, average questions, and top performing surveys.  
**Success Response:**  
```json
{
  "status": "success",
  "message": "Survey reports generated successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "summary": {
      "totalSurveys": 15,
      "activeSurveys": 12,
      "avgQuestions": 8.5
    },
    "topSurveys": [
      {
        "_id": "survey123",
        "title": "Customer Satisfaction",
        "responseCount": 45
      }
    ],
    "responseStats": [
      {
        "_id": "survey123",
        "responseCount": 45
      }
    ]
  }
}
```

### Get Response Reports – `GET /api/reports/responses` – `200 OK`
**Auth:** Yes (JWT required)  
**Role:** Admin, Analyst  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Query Parameters:**  
- `startDate` (optional): Start date for filtering (ISO format: YYYY-MM-DD)
- `endDate` (optional): End date for filtering (ISO format: YYYY-MM-DD)
- `surveyId` (optional): Specific survey ID to filter by

**Description:** Get response analytics including trends over time, sentiment analysis, and completion rates.  
**Success Response:**  
```json
{
  "status": "success",
  "message": "Response reports generated successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "responseTrends": [
      { "_id": "2024-01-01", "count": 12 },
      { "_id": "2024-01-02", "count": 18 }
    ],
    "sentimentAnalysis": [
      { "_id": "positive", "count": 25 },
      { "_id": "neutral", "count": 8 },
      { "_id": "negative", "count": 3 }
    ],
    "completionRates": [
      {
        "_id": "survey123",
        "responseCount": 45,
        "completionRate": 85.5
      }
    ]
  }
}
```

### Get Feedback Reports – `GET /api/reports/feedback` – `200 OK`
**Auth:** Yes (JWT required)  
**Role:** Admin, Analyst  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Query Parameters:**  
- `startDate` (optional): Start date for filtering (ISO format: YYYY-MM-DD)
- `endDate` (optional): End date for filtering (ISO format: YYYY-MM-DD)
- `category` (optional): Filter by feedback category

**Description:** Get feedback analytics including trends, category distribution, sentiment trends, and response time analysis.  
**Success Response:**  
```json
{
  "status": "success",
  "message": "Feedback reports generated successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "feedbackTrends": [
      { "_id": "2024-01-01", "count": 5 },
      { "_id": "2024-01-02", "count": 8 }
    ],
    "categoryDistribution": [
      { "_id": "product", "count": 15 },
      { "_id": "support", "count": 12 }
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
    "avgResponseTime": 2.5
  }
}
```

### Get User Activity Reports – `GET /api/reports/users` – `200 OK`
**Auth:** Yes (JWT required)  
**Role:** Admin only  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Query Parameters:**  
- `startDate` (optional): Start date for filtering (ISO format: YYYY-MM-DD)
- `endDate` (optional): End date for filtering (ISO format: YYYY-MM-DD)
- `role` (optional): Filter by user role

**Description:** Get user activity analytics including user statistics, role distribution, and activity trends.  
**Success Response:**  
```json
{
  "status": "success",
  "message": "User activity reports generated successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "userStats": {
      "totalUsers": 25,
      "verifiedUsers": 23,
      "activeUsers": 18
    },
    "roleDistribution": [
      { "_id": "analyst", "count": 12 },
      { "_id": "researcher", "count": 8 },
      { "_id": "admin", "count": 5 }
    ],
    "userActivity": [
      { "_id": "2024-01-01", "newUsers": 3 },
      { "_id": "2024-01-02", "newUsers": 1 }
    ]
  }
}
```

### Get Executive Summary – `GET /api/reports/executive-summary` – `200 OK`
**Auth:** Yes (JWT required)  
**Role:** Admin only  
**Headers:**  
```http
Authorization: Bearer <token>
```
**Query Parameters:**  
- `period` (optional): Number of days to analyze (default: 30, max: 365)

**Description:** Get a comprehensive executive summary with key metrics, sentiment overview, top categories, and actionable recommendations.  
**Success Response:**  
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
      { "_id": "positive", "count": 15 },
      { "_id": "neutral", "count": 6 },
      { "_id": "negative", "count": 2 }
    ],
    "topCategories": [
      { "_id": "product", "count": 8 },
      { "_id": "support", "count": 6 }
    ],
    "recommendations": [
      "Consider improving survey engagement strategies to increase response rates",
      "Focus on addressing negative feedback to improve overall satisfaction"
    ]
  }
}
```

**Usage Examples:**

```bash
# Get comprehensive analytics for January 2024
GET /api/reports/comprehensive?startDate=2024-01-01&endDate=2024-01-31

# Get survey analytics for a specific period
GET /api/reports/surveys?startDate=2024-01-01&endDate=2024-01-31

# Get response analytics for a specific survey
GET /api/reports/responses?surveyId=survey123&startDate=2024-01-01&endDate=2024-01-31

# Get feedback analytics for a specific category
GET /api/reports/feedback?category=product&startDate=2024-01-01&endDate=2024-01-31

# Get user analytics for a specific role
GET /api/reports/users?role=analyst&startDate=2024-01-01&endDate=2024-01-31

# Get executive summary for last 60 days
GET /api/reports/executive-summary?period=60
```

**Query Parameter Validation:**
- **Comprehensive Reports:** Both `startDate` and `endDate` are required
- **Date Parameters:** When `startDate` is provided, `endDate` must also be provided and vice versa
- **Date Format:** Must be in ISO format (YYYY-MM-DD)
- **Date Logic:** `endDate` must be greater than or equal to `startDate`
- **Period Parameter:** Must be between 1 and 365 days
- **Category Parameter:** Must be one of: product, ux, support, pricing, features, performance, other
- **Role Parameter:** Must be one of: admin, analyst, researcher

### Get Reports Health Check – `GET /api/reports/health` – `200 OK`
**Auth:** No  
**Description:** Health check endpoint for the reports service that returns service status and available endpoints.  
**Success Response:**  
```json
{
  "status": "success",
  "message": "Reports service is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "endpoints": [
    "GET /comprehensive - Complete analytics dashboard",
    "GET /surveys - Survey analytics",
    "GET /responses - Response analytics", 
    "GET /feedback - Feedback analytics",
    "GET /users - User analytics",
    "GET /executive-summary - Executive summary"
  ]
}
```

**Error Responses:**
```json
{
  "status": "error",
  "message": "Failed to generate reports",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "errorCode": "DATABASE_ERROR"
}
```

```json
{
  "status": "error",
  "message": "Organisation ID is required",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "errorCode": "INVALID_ORGANISATION_ID"
}
```

```json
{
  "status": "error",
  "message": "Start date and end date are required",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "errorCode": "VALIDATION_ERROR"
}
```

---

## 10. Utilities

- **generateOtp:** Generates a 6-digit OTP and expiration time (10 minutes from now).
- **sendEmail:** Sends an email using SendGrid (for OTPs, notifications, survey links).
- **generatePassword:** Generates a 12-character password for new users.
- **generateTokens:** Generates access and refresh JWT tokens for authentication.
- **analyzeSentiment:** Uses HuggingFace API to analyze sentiment for text answers/messages.

---

## 11. Database Connection

- MongoDB connection via Mongoose.
- URI from `DATABASE_URL` env variable (primary) or `MONGO_URI` (fallback), defaults to `mongodb://localhost:27017/pocket-impact`.

---

## 12. Dependencies

### Core Dependencies
- **Express:** ^5.1.0 - Web framework
- **Mongoose:** ^8.17.0 - MongoDB ODM
- **JWT:** ^9.0.2 - Authentication tokens
- **bcrypt:** ^6.0.0 - Password hashing
- **Joi:** ^18.0.0 - Request validation
- **SendGrid:** ^8.1.5 - Email service
- **CORS:** ^2.8.5 - Cross-origin resource sharing
- **Cookie Parser:** ^1.4.7 - Cookie handling

### AI & Analysis
- **@xenova/transformers:** ^2.17.2 - Sentiment analysis
- **sentiment:** ^5.0.2 - Text sentiment scoring

### Development
- **Nodemon:** ^3.1.10 - Development server
- **Jest:** ^30.0.5 - Testing framework
- **ESLint:** ^9.32.0 - Code linting
- **Prettier:** ^3.6.2 - Code formatting

---

## 13. Environment Variables

Required environment variables:
- `MONGO_URI` - MongoDB connection string (or `DATABASE_URL` as fallback)
- `ACCESS_TOKEN_SECRET` - JWT access token signing secret
- `REFRESH_TOKEN_SECRET` - JWT refresh token signing secret
- `SENDGRID_API_KEY` - SendGrid API key for emails
- `SENDGRID_SENDER_EMAIL` - Verified sender email address for SendGrid
- `CLIENT_URL` - Frontend URL for CORS
- `NODE_ENV` - Environment mode (development/production)
- `COOKIE_DOMAIN` - Cookie domain for production (optional, for cross-subdomain cookies)
- `HF_TOKEN` - HuggingFace API token for sentiment analysis (optional)

**Example .env file:**
```env
# Environment
NODE_ENV=production

# Database
DATABASE_URL=mongodb://localhost:27017/pocket-impact
# or MONGO_URI=mongodb://localhost:27017/pocket-impact

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_SENDER_EMAIL=your_verified_email@domain.com

# Frontend & CORS
CLIENT_URL=https://pocket-impact.netlify.app
COOKIE_DOMAIN=.yourdomain.com  # Optional: for cross-subdomain cookies

# AI Services (Optional)
HF_TOKEN=your_huggingface_token_here
```

---

## 14. API Base URL

**Development:** `http://localhost:3000`  
**Production:** Set via environment variables

All API endpoints are prefixed with `/api/`

---

## 15. CORS & Cookie Configuration

### CORS Settings
The API is configured with CORS to allow cross-origin requests from authorized domains:

```javascript
app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:3000',
        'https://pocket-impact.netlify.app',
        'https://pocket-impact.netlify.app/',
        'https://pocket-impact.netlify.app/*'
    ],
    credentials: true, // Allow cookies to be sent with requests
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));
```

### Cookie Configuration
Authentication tokens are stored as HTTP-only cookies for security:

**Production Environment:**
- `sameSite: 'None'` - Allows cross-origin cookies (required for frontend/backend on different domains)
- `secure: true` - HTTPS only
- `httpOnly: true` - Prevents XSS attacks

**Development Environment:**
- `sameSite: 'Strict'` - Local development security
- `secure: false` - HTTP allowed for localhost

### Frontend Requirements
To work with the cookie-based authentication:

```javascript
// For fetch requests
fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include', // Required for cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// For axios
axios.defaults.withCredentials = true;
// or per request
axios.post('/api/auth/login', { email, password }, { withCredentials: true });
```

**Supported Frontend Domains:**
- `http://localhost:3000` (development)
- `https://pocket-impact.netlify.app` (production)

---

## 16. Rate Limiting & Security

- JWT-based authentication with refresh tokens stored as HTTP-only cookies
- Role-based access control (RBAC)
- Input validation using Joi schemas
- CORS enabled with configurable origins and credentials support
- Password hashing with bcrypt
- OTP verification for user registration
- Secure password reset flow
- Cross-origin cookie support for production deployments

**Security Features:**
- HTTP-only cookies prevent XSS attacks
- Secure cookies in production (HTTPS only)
- Configurable CORS origins for production and development
- Automatic token refresh via secure cookies

---

## 17. Error Handling

All API endpoints return consistent error responses:
```json
{
  "status": "fail",
  "message": "Descriptive error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## 18. Deployment Considerations

### Production Environment Setup

**Required Environment Variables:**
```bash
NODE_ENV=production
CLIENT_URL=https://pocket-impact.netlify.app
ACCESS_TOKEN_SECRET=your_secure_secret_here
REFRESH_TOKEN_SECRET=your_secure_refresh_secret_here
```

**Cookie Configuration for Cross-Origin:**
- `sameSite: 'None'` is automatically set for production
- `secure: true` ensures HTTPS-only cookies
- Frontend must use `credentials: 'include'` for all requests

### Render Deployment
When deploying to Render:

1. **Set Environment Variables:**
   - `NODE_ENV=production`
   - `CLIENT_URL=https://pocket-impact.netlify.app`
   - All required secrets and database URLs

2. **CORS Configuration:**
   - Frontend domain is automatically allowed
   - Credentials are enabled for cookie support

3. **Health Check:**
   - Root endpoint `/` returns API status
   - Use for deployment health checks

### Frontend Integration
Your Netlify frontend must:

1. **Include Credentials:**
   ```javascript
   // All API calls must include credentials
   fetch('https://pocketimpact-backend-9749.onrender.com/api/auth/login', {
     credentials: 'include',
     // ... other options
   });
   ```

2. **Handle CORS:**
   - Backend automatically handles CORS preflight
   - Cookies are automatically sent with requests

3. **Error Handling:**
   - Handle 401 responses (token expired)
   - Implement automatic token refresh logic