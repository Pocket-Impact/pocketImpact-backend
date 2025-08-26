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
9. **Utilities**
10. **Database Connection**

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
**Description:** Login with email and password. Returns access and refresh tokens.  
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
      "phonenumber": "+1234567890",
      "organisationId": "orgId",
      "organisationName": "Acme Corp"
    }
  }
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "Email and password are required"
}
```
**Status Codes:** `200 OK`, `400 Bad Request`

### Refresh Token – `POST /api/auth/refresh-token` – `200 OK`
**Auth:** No (requires valid refresh token)  
**Description:** Use a valid refresh token (from cookie or request body) to obtain a new access token.  
**Request Body:**  
```json
{
  "refreshToken": "..." // optional, can also be sent as a cookie
}
```
**Success Response:**  
```json
{
  "status": "success",
  "accessToken": "..."
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "Invalid or expired refresh token."
}
```
**Status Codes:** `200 OK`, `401 Unauthorized`

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
**Description:** Log out the current user (clears JWT cookies).  
**Success Response:**  
```json
{
  "status": "success",
  "message": "Logged out successfully."
}
```
**Status Codes:** `200 OK`

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
**Description:** Get all users in the current organisation.  
**Success Response:**  
```json
{
  "status": "success",
  "data": [
    {
      "id": "userId",
      "fullname": "John Smith",
      "email": "john@example.com",
      "role": "analyst"
    }
    // ...
  ]
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
      "responses": 89,
      "feedbacks": 23
    },
    "dailyFeedbacks": [
      { "day": "Mon", "Feedbacks": 2 },
      { "day": "Tue", "Feedbacks": 5 },
      { "day": "Wed", "Feedbacks": 3 },
      { "day": "Thu", "Feedbacks": 7 },
      { "day": "Fri", "Feedbacks": 4 },
      { "day": "Sat", "Feedbacks": 6 },
      { "day": "Sun", "Feedbacks": 1 }
    ],
    "sentimentAnalysis": [
      { "name": "Positive", "value": 2, "color": "#7CCF00" },
      { "name": "Negative", "value": 3, "color": "#FF6900" },
      { "name": "Neutral", "value": 6, "color": "#EFB100" }
    ],
    "topTopics": [
      { "category": "Product", "count": 8 },
      { "category": "Support", "count": 6 },
      { "category": "Ux", "count": 4 },
      { "category": "Features", "count": 3 },
      { "category": "Performance", "count": 2 }
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

## 10. Utilities

- **generateOtp:** Generates a 6-digit OTP and expiration time (10 minutes from now).
- **sendEmail:** Sends an email using SendGrid (for OTPs, notifications, survey links).
- **generatePassword:** Generates a 12-character password for new users.
- **generateTokens:** Generates access and refresh JWT tokens for authentication.
- **analyzeSentiment:** Uses HuggingFace API to analyze sentiment for text answers/messages.

---

## 11. Database Connection

- MongoDB connection via Mongoose.
- URI from `MONGO_URI` env variable or defaults to `mongodb://localhost:27017/pocket-impact`.

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
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - JWT refresh secret
- `SENDGRID_API_KEY` - SendGrid API key for emails
- `CLIENT_URL` - Frontend URL for CORS
- `HUGGINGFACE_API_KEY` - API key for sentiment analysis (optional)

---

## 14. API Base URL

**Development:** `http://localhost:3000`  
**Production:** Set via environment variables

All API endpoints are prefixed with `/api/`

---

## 15. Rate Limiting & Security

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation using Joi schemas
- CORS enabled with configurable origins
- Password hashing with bcrypt
- OTP verification for user registration
- Secure password reset flow

---

## 16. Error Handling

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