# Pocket Impact Backend API Documentation

## Overview

Pocket Impact is a Node.js/Express REST API for managing users, organisations, surveys, and responses, with authentication and role-based access control. It uses MongoDB for data storage.

---

## Table of Contents

1. **Authentication**
2. **User Management**
3. **Survey & Response**
4. **Middleware**
5. **Models & Enums**
6. **Utilities**
7. **Database Connection**

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
`201 Created`, `400 Bad Request`, `500 Internal Server Error`

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
      "isVerified": true
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
`200 OK`, `400 Bad Request`

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
`200 OK`, `401 Unauthorized`

### Verify OTP – `POST /api/auth/verify-otp` – `200 OK`
**Description:** Verify the OTP sent to the user's email.  
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
`200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`

### Resend OTP – `GET /api/auth/resend-otp` – `200 OK`
**Description:** Resend a new OTP to the user's email.  
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
`200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`

### Forgot Password – `POST /api/auth/forgot-password` – `200 OK`
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
`200 OK`, `404 Not Found`, `500 Internal Server Error`

### Reset Password – `POST /api/auth/reset-password` – `200 OK`
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
`200 OK`, `400 Bad Request`, `500 Internal Server Error`

### Change Password – `POST /api/auth/change-password` – `200 OK`
**Description:** Change password for a logged-in user.  
**Request Body:**  
```json
{
  "oldPassword": "securePassword123",
  "newPassword": "newSecurePassword456"
}
```
**Success Response:**  
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "Incorrect current password"
}
```
`200 OK`, `400 Bad Request`, `500 Internal Server Error`

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
`200 OK`, `401 Unauthorized`

### Logout – `GET /api/auth/logout` – `200 OK`
**Description:** Log out the current user (clears JWT cookies).  
**Success Response:**  
```json
{
  "status": "success",
  "message": "Logged out successfully."
}
```
`200 OK`

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
`201 Created`, `400 Bad Request`, `500 Internal Server Error`

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
`200 OK`, `500 Internal Server Error`

---

## 3. Survey & Response

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
`201 Created`, `400 Bad Request`, `500 Internal Server Error`

### Get Surveys – `GET /api/surveys/:organisationId` – `200 OK`
**Description:** Get all surveys for the current organisation.  
`200 OK`, `500 Internal Server Error`

### Update Survey – `PUT /api/surveys/:surveyId` – `200 OK`
**Description:** Update a survey by ID.  
**Request Body:** `title`, `description`, `questions`  
`200 OK`, `400 Bad Request`, `500 Internal Server Error`

### Delete Survey – `DELETE /api/surveys/:surveyId` – `200 OK`
**Description:** Delete a survey by ID.  
`200 OK`, `404 Not Found`, `500 Internal Server Error`

### Send Survey Link – `POST /api/surveys/send-survey-link` – `200 OK`
**Description:** Send survey link via email to multiple recipients.  
**Request Body:** `surveyId`, `emails`  
`200 OK`, `400 Bad Request`, `500 Internal Server Error`

### Get Survey by Unique Link – `GET /api/surveys/unique/:uniqueLinkId` – `200 OK`
**Description:** Get a survey by its unique link ID.  
`200 OK`, `404 Not Found`, `500 Internal Server Error`

### Submit Response – `POST /api/responses` – `201 Created`
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
`201 Created`, `400 Bad Request`, `500 Internal Server Error`


### Get Responses by Survey – `GET /api/responses/:surveyId` – `200 OK`
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
`200 OK`, `404 Not Found`, `500 Internal Server Error`

### Submit Organisation Response – `POST /api/responses/organisation` – `201 Created`
**Description:** Submit general response for an organisation (not tied to a survey). Response can be categorized and optionally analyzed for sentiment.  
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
  "message": "Response submitted successfully.",
  "data": {
    "_id": "responseId",
    "organisationId": "org123",
    "message": "Great product, but could be faster!",
    "category": "performance",
    "sentiment": "neutral",
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
`201 Created`, `400 Bad Request`, `500 Internal Server Error`

### Get Organisation Responses – `GET /api/responses/organisation/:organisationId` – `200 OK`
**Description:** Get all general responses for a specific organisation.  
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
`200 OK`, `404 Not Found`, `500 Internal Server Error`

### Delete Organisation Response – `DELETE /api/responses/organisation/:id` – `200 OK`
**Description:** Delete a general response entry by its ID.  
**Success Response:**  
```json
{
  "status": "success",
  "message": "Response deleted successfully."
}
```
**Error Response:**  
```json
{
  "status": "fail",
  "message": "Response not found."
}
```
`200 OK`, `404 Not Found`, `500 Internal Server Error`

---

## 4. Middleware

- **protect:** Checks for JWT in cookies, verifies token, attaches user info to `req.user`.
- **restrictTo(...roles):** Restricts access to users with specified roles.

  **Example:**
  ```js
  router.get('/admin-data', protect, restrictTo('admin'), controller);
  ```

- **requireVerifiedUser:** Ensures the user is verified before allowing access to certain routes.

---

## 5. Models & Enums

### User
- `fullname` (string, required)
- `email` (string, required, unique, validated)
- `phonenumber` (string, required, validated, E.164 format)
- `organisation` (ObjectId, ref: Organisation, required)
- `role` (enum: 'admin', 'analyst', 'researcher', required)
- `password` (string, required, hashed)
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
- For organisation responses:
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

---

## 6. Utilities

- **generateOtp:** Generates a 6-digit OTP and expiration time (10 minutes from now).
- **sendEmail:** Sends an email using SendGrid (for OTPs, notifications, survey links).
- **generatePassword:** Generates a 12-character password for new users.
- **generateTokens:** Generates access and refresh JWT tokens for authentication.
- **analyzeSentiment:** Uses HuggingFace API to analyze sentiment for text answers/messages.

---

## 7. Database Connection

- MongoDB connection via Mongoose.
- URI from `MONGO_URI` env variable or defaults to `mongodb://localhost:27017/pocket-impact`.

---